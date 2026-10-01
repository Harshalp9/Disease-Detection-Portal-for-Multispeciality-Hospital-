"""
API Routes for Inference Endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import logging
import base64
from datetime import datetime

from ..services.inference import get_inference_engine
from ..services.model_loader import get_model_registry
from ..schemas import (
    DentalAnomalyResult,
    ChestXrayResult,
    FractureResult,
    FractureAnnotatedResponse,
    HealthCheck
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/inference", tags=["inference"])

@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    registry = get_model_registry()
    gpu_available = False
    try:
        import torch
        gpu_available = torch.cuda.is_available()
    except:
        pass
    
    return HealthCheck(
        status="healthy",
        loaded_models=list(registry.list_models().keys()),
        gpu_available=gpu_available,
        timestamp=datetime.now()
    )

@router.post("/dental", response_model=DentalAnomalyResult)
async def detect_dental_anomaly(file: UploadFile = File(...)):
    """
    Detect dental anomalies in X-ray images
    
    - **file**: X-ray image (PNG, JPG, etc.)
    """
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        image_bytes = await file.read()
        
        engine = get_inference_engine()
        result = engine.infer_dental(image_bytes)
        
        logger.info(f"Dental inference completed: {result.class_name} ({result.confidence:.2%})")
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dental inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@router.post("/chest-xray", response_model=ChestXrayResult)
async def detect_chest_diseases(file: UploadFile = File(...)):
    """
    Detect multiple diseases in chest X-ray images
    
    Detects:
    - Pneumonia
    - Tuberculosis (TB)
    - COVID-19
    - Other pulmonary conditions
    
    - **file**: Chest X-ray image (PNG, JPG, etc.)
    """
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        image_bytes = await file.read()
        
        engine = get_inference_engine()
        result = engine.infer_chest_xray(image_bytes)
        
        logger.info(f"Chest X-ray inference completed: {result.primary_finding}")
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chest X-ray inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@router.post("/fracture", response_model=FractureResult)
async def detect_fracture(file: UploadFile = File(...)):
    """
    Detect fractures in bone X-ray images
    
    - **file**: Bone X-ray image (PNG, JPG, etc.)
    """
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        image_bytes = await file.read()
        
        engine = get_inference_engine()
        result = engine.infer_fracture(image_bytes)
        
        logger.info(f"Fracture inference completed: {result.fracture_type}")
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fracture inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@router.post("/fracture/annotated", response_model=FractureAnnotatedResponse)
async def detect_fracture_with_image(file: UploadFile = File(...)):
    """
    Detect fractures and return the annotated output image.

    - **file**: Bone X-ray image (PNG, JPG, etc.)
    """
    try:
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        image_bytes = await file.read()
        
        engine = get_inference_engine()
        result, annotated_bytes = engine.infer_fracture_visualization(image_bytes)
        encoded_image = base64.b64encode(annotated_bytes).decode("utf-8")

        logger.info(f"Fracture annotated inference completed: {result.fracture_type}")
        return {
            "result": result,
            "annotated_image_base64": encoded_image
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fracture annotated inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@router.get("/models")
async def list_models():
    """List all loaded models"""
    registry = get_model_registry()
    models = registry.list_models()
    
    return {
        "available_models": models,
        "total_models": len(models),
        "endpoints": {
            "dental": "/api/inference/dental",
            "chest_xray": "/api/inference/chest-xray",
            "fracture": "/api/inference/fracture"
        }
    }
