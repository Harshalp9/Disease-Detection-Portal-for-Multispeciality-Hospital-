"""
Image Processing Service
Handles image preprocessing for different model types
"""

import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Image preprocessing for medical imaging models"""
    
    @staticmethod
    def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
        """Load PIL Image from bytes"""
        try:
            img = Image.open(BytesIO(image_bytes))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            return img
        except Exception as e:
            logger.error(f"Failed to load image: {str(e)}")
            raise
    
    @staticmethod
    def preprocess_dental(image: Image.Image, 
                         target_size: int = 224,
                         normalize: bool = True) -> np.ndarray:
        """Preprocess dental X-ray images"""
        # Resize
        img_resized = image.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
        # Convert to array and normalize
        img_array = np.array(img_resized).astype(np.float32)
        
        if normalize:
            # ImageNet normalization
            mean = np.array([0.485, 0.456, 0.406]) * 255
            std = np.array([0.229, 0.224, 0.225]) * 255
            img_array = (img_array - mean) / std
        else:
            img_array = img_array / 255.0
        
        # PyTorch format: CHW
        if img_array.ndim == 3:
            img_array = np.transpose(img_array, (2, 0, 1))
        else:
            img_array = np.expand_dims(img_array, axis=0)
            img_array = np.repeat(img_array, 3, axis=0)
        
        return np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    @staticmethod
    def preprocess_chest_xray(image: Image.Image,
                             target_size: int = 224,
                             normalize: bool = True) -> np.ndarray:
        """Preprocess chest X-ray images for TensorFlow models"""
        # Resize
        img_resized = image.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
        # Convert to array
        img_array = np.array(img_resized).astype(np.float32)
        
        # Convert grayscale to 3-channel if needed
        if img_array.ndim == 2:
            img_array = np.stack([img_array] * 3, axis=-1)
        
        if normalize:
            # ImageNet normalization
            mean = np.array([0.485, 0.456, 0.406]) * 255
            std = np.array([0.229, 0.224, 0.225]) * 255
            img_array = (img_array - mean) / std
        else:
            img_array = img_array / 255.0
        
        # TensorFlow format: NHWC (already in this format)
        return np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    @staticmethod
    def preprocess_fracture(image: Image.Image,
                           target_size: int = 256,
                           normalize: bool = True) -> np.ndarray:
        """Preprocess fracture detection images"""
        # Higher resolution for detail detection
        img_resized = image.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
        img_array = np.array(img_resized).astype(np.float32)
        
        # Convert grayscale to 3-channel
        if img_array.ndim == 2:
            img_array = np.stack([img_array] * 3, axis=-1)
        
        if normalize:
            mean = np.array([0.485, 0.456, 0.406]) * 255
            std = np.array([0.229, 0.224, 0.225]) * 255
            img_array = (img_array - mean) / std
        else:
            img_array = img_array / 255.0
        
        # PyTorch format: CHW
        img_array = np.transpose(img_array, (2, 0, 1))
        return np.expand_dims(img_array, axis=0)  # Add batch dimension
    
    @staticmethod
    def postprocess_classification(logits: np.ndarray,
                                  class_names: list) -> Tuple[str, float, int]:
        """
        Post-process classification output
        
        Returns:
            class_name, confidence, class_index
        """
        # Convert logits to probabilities
        if logits.max() > 1:
            # Likely logits
            probs = 1 / (1 + np.exp(-logits))
        else:
            probs = logits
        
        # Get top prediction
        class_idx = np.argmax(probs)
        confidence = float(probs[class_idx])
        class_name = class_names[class_idx] if class_idx < len(class_names) else "Unknown"
        
        return class_name, confidence, int(class_idx)
    
    @staticmethod
    def postprocess_multilabel(logits: np.ndarray,
                              class_names: list,
                              threshold: float = 0.5) -> Dict[str, float]:
        """
        Post-process multi-label classification output (e.g., chest X-ray diseases)
        
        Returns:
            Dictionary of {disease_name: confidence}
        """
        # Convert to probabilities
        if logits.ndim > 1:
            logits = logits.flatten()
        
        probs = 1 / (1 + np.exp(-logits))
        
        results = {}
        for i, (prob, name) in enumerate(zip(probs, class_names)):
            if prob > threshold:
                results[name] = float(prob)
        
        return results if results else {"No abnormality detected": 0.0}
