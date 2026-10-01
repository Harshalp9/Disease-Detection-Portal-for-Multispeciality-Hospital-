from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

class InferenceResult(BaseModel):
    """Base model for inference results"""
    model_name: str
    confidence: float
    class_name: str
    class_index: int
    processing_time_ms: float
    timestamp: datetime
    metadata: Dict[str, Any] = {}

class DentalAnomalyResult(InferenceResult):
    """Dental anomaly detection result"""
    anomaly_type: str
    location: str = "Unknown"
    severity: str  # "Low", "Medium", "High"
    recommendations: List[str] = []

class ChestXrayResult(InferenceResult):
    """Chest X-ray multi-disease detection result"""
    diseases: Dict[str, float]  # disease_name -> confidence
    primary_finding: str
    secondary_findings: List[str] = []
    clinical_notes: str = ""

class FractureResult(InferenceResult):
    """Fracture detection result"""
    fracture_type: str
    location: str
    severity: str  # "Hairline", "Stable", "Displaced"
    affected_bone: str

class BatchInferenceRequest(BaseModel):
    """Request for batch inference"""
    model_type: str  # "dental", "chest_xray", "fracture"
    images_count: int

class FractureAnnotatedResponse(BaseModel):
    """Fracture inference result with annotated output image"""
    result: FractureResult
    annotated_image_base64: str

class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    loaded_models: List[str]
    gpu_available: bool
    timestamp: datetime
