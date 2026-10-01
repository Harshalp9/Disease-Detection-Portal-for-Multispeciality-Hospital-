"""
FastAPI Application for Medical Imaging AI Pipeline
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from datetime import datetime
import torch

from .routers import inference
from .services.model_loader import initialize_models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Medical Imaging AI Pipeline",
    description="Hospital-grade ML inference server for dental, chest X-ray, and fracture detection",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize models and services on startup"""
    logger.info("=" * 50)
    logger.info("Starting Medical Imaging AI Pipeline")
    logger.info("=" * 50)
    
    # Check GPU availability
    gpu_available = torch.cuda.is_available()
    device = "cuda" if gpu_available else "cpu"
    logger.info(f"GPU Available: {gpu_available} (Device: {device})")
    
    # Initialize models
    try:
        model_registry = initialize_models(device=device)
        logger.info(f"Loaded {len(model_registry.models)} models")
        for model_name, model_type in model_registry.list_models().items():
            logger.info(f"  - {model_name} ({model_type})")
    except Exception as e:
        logger.warning(f"Model initialization warning: {str(e)}")
    
    logger.info("Server ready to accept requests")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Medical Imaging AI Pipeline")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Medical Imaging AI Pipeline",
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "documentation": {
            "swagger": "/api/docs",
            "redoc": "/api/redoc",
            "openapi": "/api/openapi.json"
        },
        "endpoints": {
            "health": "/api/inference/health",
            "models": "/api/inference/models",
            "dental_detection": "/api/inference/dental",
            "chest_xray_detection": "/api/inference/chest-xray",
            "fracture_detection": "/api/inference/fracture",
            "fracture_annotated": "/api/inference/fracture/annotated"
        }
    }

# Include routers
app.include_router(inference.router)

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("BACKEND_PORT", "8000"))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    
    logger.info(f"Starting Uvicorn server on {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
