"""
Inference Service
Handles model predictions for all medical imaging types
"""

import time
import numpy as np
import torch
from typing import Dict, Optional, Tuple
from datetime import datetime
import logging
from io import BytesIO
from pathlib import Path
from PIL import Image

from .model_loader import get_model_registry
from .image_processor import ImageProcessor
from ..schemas import DentalAnomalyResult, ChestXrayResult, FractureResult

logger = logging.getLogger(__name__)

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None
    logger.warning("Ultralytics YOLO is not installed. Fracture visualization endpoints require it.")


class InferenceEngine:

    def __init__(self):
        self.registry = get_model_registry()
        self.image_processor = ImageProcessor()

    def _get_yolo_fracture_model_path(self) -> Path:
        return Path(__file__).parents[2] / "models" / "fracture_model" / "best.pt"

    def _load_yolo_fracture_model(self):
        model_path = self._get_yolo_fracture_model_path()
        if YOLO is None:
            raise RuntimeError("Ultralytics YOLO is required for fracture detection but is not installed.")
        if not model_path.exists():
            raise FileNotFoundError(f"Fracture YOLO model not found at {model_path}")
        return YOLO(str(model_path))

    def _build_fracture_result(self, detections: list, processing_time: float) -> FractureResult:
        if detections:
            top = max(detections, key=lambda d: d["confidence"])
            class_index = top.get("class_index", -1)
            confidence = float(top["confidence"])
            class_name = top["label"]
            fracture_type = class_name
            severity = "Severe" if confidence > 0.8 else "Moderate"
        else:
            class_index = -1
            confidence = 0.0
            class_name = "No Fracture Detected"
            fracture_type = "Normal"
            severity = "None"

        return FractureResult(
            model_name="Custom YOLOv11 Fracture Detection",
            confidence=confidence,
            class_name=class_name,
            class_index=class_index,
            processing_time_ms=processing_time,
            timestamp=datetime.now(),
            fracture_type=fracture_type,
            severity=severity,
            location="Unknown",
            affected_bone="Unknown",
            metadata={
                "detections": detections,
                "fracture_count": len(detections),
                "model_source": "ultralytics-yolo"
            }
        )

    def _run_yolo_fracture(self, image: Image.Image, include_visualization: bool = False) -> Tuple[FractureResult, Optional[bytes]]:
        model = self._load_yolo_fracture_model()
        results = model.predict(
            source=image,
            conf=0.25,
            imgsz=1024,
            save=False,
            verbose=False
        )

        yolo_result = results[0]
        detections = []
        for box in yolo_result.boxes:
            coords = [round(float(x), 2) for x in box.xyxy[0].tolist()]
            confidence = float(box.conf[0])
            class_index = int(box.cls[0])
            label = model.names[class_index]
            detections.append({
                "box": coords,
                "label": label,
                "confidence": confidence,
                "class_index": class_index
            })

        annotated_bytes = None
        if include_visualization:
            plotted = yolo_result.plot()
            if isinstance(plotted, np.ndarray):
                annotated_img = Image.fromarray(plotted.astype("uint8"))
            else:
                annotated_img = plotted
            buffer = BytesIO()
            annotated_img.save(buffer, format="PNG")
            annotated_bytes = buffer.getvalue()

        processing_time = (time.time() - self._start_time) * 1000
        return self._build_fracture_result(detections, processing_time), annotated_bytes

    def infer_fracture(self, image_bytes: bytes) -> FractureResult:
        self._start_time = time.time()
        image = self.image_processor.load_image_from_bytes(image_bytes)
        return self._run_yolo_fracture(image, include_visualization=False)[0]

    def infer_fracture_visualization(self, image_bytes: bytes) -> Tuple[FractureResult, bytes]:
        self._start_time = time.time()
        image = self.image_processor.load_image_from_bytes(image_bytes)
        result, annotated_bytes = self._run_yolo_fracture(image, include_visualization=True)
        return result, annotated_bytes

    # -------------------- CHEST X-RAY --------------------
    def infer_chest_xray(self, image_bytes: bytes) -> ChestXrayResult:
        start_time = time.time()

        try:
            # Load + preprocess
            image = self.image_processor.load_image_from_bytes(image_bytes)
            input_tensor = self.image_processor.preprocess_chest_xray(image)

            # Load model
            model_data = self.registry.get_model("chest_xray_model")
            if not model_data:
                raise ValueError("Chest X-ray model not loaded")

            model, metadata = model_data

            # Run inference
            import tensorflow as tf
            input_tensor_tf = tf.convert_to_tensor(input_tensor, dtype=tf.float32)
            output = model(input_tensor_tf)

            logits = output.numpy() if hasattr(output, 'numpy') else np.array(output)

            # 🔥 SAFE MULTI-CLASS HANDLING
            probs = logits[0]
            classes = metadata.output_classes

            print("Model output:", probs)
            print("Length probs:", len(probs))
            print("Length classes:", len(classes))

            # Safe prediction
            idx = int(np.argmax(probs))
            primary_finding = classes[idx] if idx < len(classes) else f"class_{idx}"
            confidence = float(probs[idx])

            # Safe mapping (no crash)
            diseases = {}
            for i in range(len(probs)):
                if i < len(classes):
                    diseases[classes[i]] = float(probs[i])
                else:
                    diseases[f"class_{i}"] = float(probs[i])

            processing_time = (time.time() - start_time) * 1000

            return ChestXrayResult(
                model_name="Chest X-ray Multi-Disease Detection",
                confidence=confidence,
                class_name=primary_finding,
                class_index=idx,
                processing_time_ms=processing_time,
                timestamp=datetime.now(),
                diseases=diseases,
                primary_finding=primary_finding,
                secondary_findings=[k for k in diseases if k != primary_finding],
                clinical_notes="Auto-generated",
                metadata={
                    "model_version": "v2.0",
                    "input_size": metadata.input_shape,
                }
            )

        except Exception as e:
            logger.error(f"Chest X-ray inference failed: {str(e)}")
            raise

    # -------------------- DENTAL --------------------
    def infer_dental(self, image_bytes: bytes) -> DentalAnomalyResult:
        start_time = time.time()

        image = self.image_processor.load_image_from_bytes(image_bytes)
        input_tensor = self.image_processor.preprocess_dental(image)

        model, metadata = self.registry.get_model("dental_model")

        with torch.no_grad():
            if isinstance(input_tensor, np.ndarray):
                input_tensor = torch.from_numpy(input_tensor)

            output = model(input_tensor)
            if isinstance(output, tuple):
                output = output[0]

        logits = output.cpu().numpy()

        probs = logits[0]
        classes = metadata.output_classes

        idx = int(np.argmax(probs))
        class_name = classes[idx]
        confidence = float(probs[idx])

        processing_time = (time.time() - start_time) * 1000

        return DentalAnomalyResult(
            model_name="Dental Analysis",
            confidence=confidence,
            class_name=class_name,
            class_index=idx,
            processing_time_ms=processing_time,
            timestamp=datetime.now(),
            anomaly_type=class_name,
            severity="High" if confidence > 0.7 else "Medium",
            recommendations=["Consult dentist"],
            metadata={"input_size": metadata.input_shape}
        )


# GLOBAL INSTANCE
inference_engine: Optional[InferenceEngine] = None


def get_inference_engine() -> InferenceEngine:
    global inference_engine
    if inference_engine is None:
        inference_engine = InferenceEngine()
    return inference_engine

