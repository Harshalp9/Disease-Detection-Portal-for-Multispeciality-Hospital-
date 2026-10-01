"""
Model Loading Service
Handles both PyTorch (.pth) and TensorFlow/Keras SavedModel format loading
"""

import os
import json
import torch
import numpy as np
from typing import Dict, Any, Tuple, Optional
from pathlib import Path
import logging
from datetime import datetime
from ultralytics import YOLO

logger = logging.getLogger(__name__)

class YOLOModelLoader:
    @staticmethod
    def load(model_path: str):
        # This loads the model architecture and the pre-trained weights
        model = YOLO(model_path) 
        return model
    
class ModelMetadata:
    """Container for model metadata and preprocessing config"""
    def __init__(self, 
                 model_name: str,
                 input_shape: Tuple[int, ...],
                 output_classes: list,
                 preprocessing: Dict[str, Any],
                 format_type: str):
        self.model_name = model_name
        self.input_shape = input_shape
        self.output_classes = output_classes
        self.preprocessing = preprocessing
        self.format_type = format_type  # "pytorch" or "tensorflow"
        self.loaded_at = datetime.now()

class PyTorchModelLoader:
    """Loads PyTorch models with embedded metadata"""
    
    @staticmethod
    def load(model_path: str, device: str = "cpu") -> Tuple[torch.nn.Module, ModelMetadata]:
        """
        Load PyTorch model and metadata
        Expected format: .pth file with state dict
        """
        logger.info(f"Loading PyTorch model from {model_path}")
        
        checkpoint = torch.load(model_path, map_location=device, weights_only=False)
        
        # Extract metadata if available
        metadata_dict = checkpoint.get("metadata", {})
        
        # Create model instance (this requires the actual model class)
        # For production, you'd load the architecture separately
        model = checkpoint.get("model", None)
        if model is None:
            state_dict = checkpoint.get("state_dict", checkpoint)
            logger.warning("No model instance found, only state dict provided")
            return state_dict, PyTorchModelLoader._create_metadata(metadata_dict)
        
        model.to(device)
        model.eval()
        
        metadata = PyTorchModelLoader._create_metadata(metadata_dict)
        return model, metadata
    
    @staticmethod
    def _create_metadata(metadata_dict: Dict) -> ModelMetadata:
        """Create ModelMetadata from dictionary"""
        return ModelMetadata(
            model_name=metadata_dict.get("model_name", "unknown"),
            input_shape=tuple(metadata_dict.get("input_shape", [3, 224, 224])),
            output_classes=metadata_dict.get("output_classes", ["normal", "anomaly"]),
            preprocessing={
                "mean": metadata_dict.get("mean", [0.485, 0.456, 0.406]),
                "std": metadata_dict.get("std", [0.229, 0.224, 0.225]),
                "input_size": metadata_dict.get("input_size", 224),
                "normalize": metadata_dict.get("normalize", True),
            },
            format_type="pytorch"
        )

class TensorFlowModelLoader:
    """Loads TensorFlow SavedModel format with metadata"""
    
    @staticmethod
    def load(model_path: str) -> Tuple[Any, ModelMetadata]:
        """
        Load TensorFlow SavedModel and metadata
        Expected: SavedModel directory with metadata.json alongside
        """
        logger.info(f"Loading TensorFlow model from {model_path}")
        
        try:
            import tensorflow as tf
        except ImportError:
            logger.error("TensorFlow not installed")
            raise
        
        # Load SavedModel
        model = tf.saved_model.load(model_path)
        
        # Load metadata if exists
        metadata_path = Path(model_path) / "metadata.json"
        metadata_dict = {}
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                metadata_dict = json.load(f)
        print("🔥 LOADED CLASSES:", metadata_dict.get("output_classes"))
        metadata = TensorFlowModelLoader._create_metadata(metadata_dict)
        return model, metadata
    
    @staticmethod
    def _create_metadata(metadata_dict: Dict) -> ModelMetadata:
        """Create ModelMetadata from dictionary"""
        return ModelMetadata(
            model_name=metadata_dict.get("model_name", "unknown"),
            input_shape=tuple(metadata_dict.get("input_shape", [1, 224, 224, 3])),
            output_classes=metadata_dict.get("output_classes", ["normal", "abnormal"]),
            preprocessing={
                "mean": metadata_dict.get("mean", [0.485, 0.456, 0.406]),
                "std": metadata_dict.get("std", [0.229, 0.224, 0.225]),
                "input_size": metadata_dict.get("input_size", 224),
                "normalize": metadata_dict.get("normalize", True),
            },
            format_type="tensorflow"
        )

class ModelRegistry:
    """Central registry for all loaded models"""
    
    def __init__(self, device: str = "cpu"):
        self.models: Dict[str, Tuple[Any, ModelMetadata]] = {}
        self.device = device
        logger.info(f"ModelRegistry initialized with device: {device}")
    
    def register_pytorch_model(self, name: str, model_path: str) -> bool:
        """Register a PyTorch model"""
        try:
            model, metadata = PyTorchModelLoader.load(model_path, self.device)
            self.models[name] = (model, metadata)
            logger.info(f"Registered PyTorch model: {name}")
            return True
        except Exception as e:
            logger.error(f"Failed to register PyTorch model {name}: {str(e)}")
            return False
    
    def register_tensorflow_model(self, name: str, model_path: str) -> bool:
        """Register a TensorFlow model"""
        try:
            model, metadata = TensorFlowModelLoader.load(model_path)
            self.models[name] = (model, metadata)
            logger.info(f"Registered TensorFlow model: {name}")
            return True
        except Exception as e:
            logger.error(f"Failed to register TensorFlow model {name}: {str(e)}")
            return False
    
    def get_model(self, name: str) -> Optional[Tuple[Any, ModelMetadata]]:
        """Retrieve a model and its metadata"""
        return self.models.get(name)
    
    def list_models(self) -> Dict[str, str]:
        """List all registered models with their types"""
        return {
            name: metadata.format_type 
            for name, (_, metadata) in self.models.items()
        }
    
    def is_model_loaded(self, name: str) -> bool:
        """Check if a model is loaded"""
        return name in self.models

# Global registry instance
model_registry: Optional[ModelRegistry] = None

def initialize_models(device: str = "cpu"):
    """Initialize model registry and load models"""
    global model_registry
    model_registry = ModelRegistry(device)
    
    # Load models if they exist in the models directory
    models_dir = Path(__file__).parent.parent.parent / "models"
    
    if models_dir.exists():
        # Load PyTorch models
        for pth_file in models_dir.glob("*.pth"):
            model_name = pth_file.stem
            model_registry.register_pytorch_model(model_name, str(pth_file))
        
        # Load TensorFlow SavedModels
        for saved_model_dir in models_dir.iterdir():
            if saved_model_dir.is_dir() and (saved_model_dir / "saved_model.pb").exists():
                model_name = saved_model_dir.name
                model_registry.register_tensorflow_model(model_name, str(saved_model_dir))
    
    logger.info(f"Initialized {len(model_registry.models)} models")
    return model_registry

def get_model_registry() -> ModelRegistry:
    """Get the global model registry"""
    global model_registry
    if model_registry is None:
        model_registry = initialize_models()
    return model_registry
