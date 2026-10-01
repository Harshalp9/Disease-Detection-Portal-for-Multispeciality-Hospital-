# Medical Imaging AI Model Guide

Complete guide for saving, loading, and integrating deep learning and machine learning models for the hospital diagnostic dashboard.

## Table of Contents
1. [PyTorch Model Format (Dental & Fracture)](#pytorch-model-format)
2. [TensorFlow/Keras Model Format (Chest X-ray)](#tensorflow-keras-model-format)
3. [Model Structure](#model-structure)
4. [Saving Your Models](#saving-your-models)
5. [Integration Checklist](#integration-checklist)
6. [Preprocessing Pipeline](#preprocessing-pipeline)

---

## PyTorch Model Format

### For: Dental Anomaly Detection & Fracture Detection

PyTorch models are saved as `.pth` files containing the complete model state and metadata.

### Saving PyTorch Models

```python
import torch

# Define your model
model = YourDentalModel()  # or YourFractureModel()

# Train your model...
# model.train()
# ... training code ...
# model.eval()

# Save with metadata and preprocessing config
checkpoint = {
    'model': model,  # Complete model instance
    'state_dict': model.state_dict(),  # Model weights only
    'metadata': {
        'model_name': 'dental_model',  # IMPORTANT: Use 'dental_model' for dental
        'input_shape': [3, 224, 224],  # [channels, height, width]
        'output_classes': [
            'normal',
            'caries',
            'periapical_lesion',
            'impaction',
            'bone_loss',
            'root_anomaly'
        ],
        'mean': [0.485, 0.456, 0.406],  # ImageNet normalization
        'std': [0.229, 0.224, 0.225],
        'input_size': 224,
        'normalize': True,
    }
}

# Save the checkpoint
torch.save(checkpoint, 'backend/models/dental_model.pth')  # or fracture_model.pth
```

### Expected Checkpoint Structure

```
{
    'model': <nn.Module>,  # Complete model (required for inference)
    'state_dict': {...},   # Model weights (optional backup)
    'metadata': {
        'model_name': str,           # Unique identifier
        'input_shape': [3, 224, 224], # Input dimensions (C, H, W)
        'output_classes': [...],     # List of class names
        'mean': [float, float, float], # Normalization mean
        'std': [float, float, float],  # Normalization std
        'input_size': int,           # Input resolution
        'normalize': bool            # Apply normalization
    }
}
```

### File Location
```
backend/models/dental_model.pth        # Dental anomaly detection
backend/models/fracture_model.pth      # Fracture detection (future)
```

---

## TensorFlow/Keras Model Format

### For: Chest X-ray Multi-disease Detection

TensorFlow models are saved in SavedModel format with accompanying metadata.

### Saving TensorFlow Models

```python
import tensorflow as tf
import json

# Define your model
model = tf.keras.Model(...)  # Your chest X-ray model

# Train your model...
# model.fit(...)

# Save in SavedModel format
model.save('backend/models/chest_xray_model')

# Create and save metadata.json in the same directory
metadata = {
    'model_name': 'chest_xray_model',  # IMPORTANT: Use 'chest_xray_model'
    'input_shape': [1, 224, 224, 3],   # [batch, height, width, channels]
    'output_classes': [
        'normal',
        'pneumonia',
        'tuberculosis',
        'covid_19',
        'pulmonary_edema',
        'nodule',
        'pleural_effusion'
    ],
    'mean': [0.485, 0.456, 0.406],     # Normalization mean
    'std': [0.229, 0.224, 0.225],      # Normalization std
    'input_size': 224,
    'normalize': True,
    'model_version': 'v2.0',
    'framework': 'tensorflow',
    'input_dtype': 'float32'
}

# Save metadata alongside the model
with open('backend/models/chest_xray_model/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
```

### Expected SavedModel Structure

```
backend/models/chest_xray_model/
├── saved_model.pb          # TensorFlow SavedModel file
├── variables/
│   ├── variables.data-00000-of-00001
│   └── variables.index
├── assets/                 # Optional: model assets
└── metadata.json          # Metadata file (REQUIRED)
```

### Metadata File Template

```json
{
    "model_name": "chest_xray_model",
    "input_shape": [1, 224, 224, 3],
    "output_classes": [
        "normal",
        "pneumonia",
        "tuberculosis",
        "covid_19",
        "pulmonary_edema",
        "nodule",
        "pleural_effusion"
    ],
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225],
    "input_size": 224,
    "normalize": true,
    "model_version": "v2.0"
}
```

---

## Model Structure

### Class Names - Dental Model

```python
['normal', 'caries', 'periapical_lesion', 'impaction', 'bone_loss', 'root_anomaly']
```

### Class Names - Chest X-ray Model

```python
['normal', 'pneumonia', 'tuberculosis', 'covid_19', 'pulmonary_edema', 'nodule', 'pleural_effusion']
```

### Class Names - Fracture Model (Future)

```python
['normal', 'hairline', 'stable', 'displaced', 'comminuted']
```

---

## Saving Your Models

### Step-by-Step: PyTorch Model

```python
import torch
from pathlib import Path

# 1. Create models directory if it doesn't exist
Path('backend/models').mkdir(parents=True, exist_ok=True)

# 2. Define your model
class DentalAnomalyDetector(torch.nn.Module):
    def __init__(self):
        super().__init__()
        # Your model architecture
        ...
    
    def forward(self, x):
        # Your forward pass
        ...

# 3. Initialize and train
model = DentalAnomalyDetector()
# ... training code ...

# 4. Save with metadata
torch.save({
    'model': model,
    'state_dict': model.state_dict(),
    'metadata': {
        'model_name': 'dental_model',
        'input_shape': [3, 224, 224],
        'output_classes': ['normal', 'caries', 'periapical_lesion', 'impaction', 'bone_loss', 'root_anomaly'],
        'mean': [0.485, 0.456, 0.406],
        'std': [0.229, 0.224, 0.225],
        'input_size': 224,
        'normalize': True,
    }
}, 'backend/models/dental_model.pth')

print("✓ Model saved successfully")
```

### Step-by-Step: TensorFlow Model

```python
import tensorflow as tf
import json
from pathlib import Path

# 1. Create models directory if it doesn't exist
Path('backend/models').mkdir(parents=True, exist_ok=True)

# 2. Define and train your model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(224, 224, 3)),
    # Your layers...
])

# ... training code ...

# 3. Save the model
model.save('backend/models/chest_xray_model')

# 4. Create metadata.json
metadata = {
    'model_name': 'chest_xray_model',
    'input_shape': [1, 224, 224, 3],
    'output_classes': ['normal', 'pneumonia', 'tuberculosis', 'covid_19', 'pulmonary_edema', 'nodule', 'pleural_effusion'],
    'mean': [0.485, 0.456, 0.406],
    'std': [0.229, 0.224, 0.225],
    'input_size': 224,
    'normalize': True,
    'model_version': 'v2.0'
}

with open('backend/models/chest_xray_model/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✓ Model saved successfully")
```

---

## Integration Checklist

Before deploying your models, ensure:

### For PyTorch Models (Dental & Fracture)
- [ ] Model saved with `torch.save()` to `.pth` file
- [ ] Checkpoint includes 'model' key with complete model instance
- [ ] Metadata includes all required fields
- [ ] `model_name` matches expected name ('dental_model' or 'fracture_model')
- [ ] Input shape is `[channels, height, width]` format
- [ ] Output classes list matches model output
- [ ] Normalization parameters are correct
- [ ] File location: `backend/models/{name}.pth`

### For TensorFlow Models (Chest X-ray)
- [ ] Model saved using `model.save()` to directory
- [ ] SavedModel contains `saved_model.pb` and `variables/`
- [ ] `metadata.json` created in model directory
- [ ] `model_name` is 'chest_xray_model'
- [ ] Input shape is `[batch, height, width, channels]` format
- [ ] Output classes list matches model output
- [ ] Normalization parameters are correct
- [ ] File location: `backend/models/chest_xray_model/`

### Backend Integration
- [ ] Models placed in `backend/models/` directory
- [ ] FastAPI server has access to models directory
- [ ] `model_loader.py` can find and load models
- [ ] Test API endpoints at `localhost:8000/api/inference/dental` etc.

---

## Preprocessing Pipeline

### Automatic Preprocessing

The backend automatically applies preprocessing based on model type:

#### PyTorch Models (Dental & Fracture)
```python
# 1. Load image and convert to RGB
image = Image.open(file).convert('RGB')

# 2. Resize to target size (224 or 256)
image = image.resize((224, 224), Image.Resampling.LANCZOS)

# 3. Normalize (ImageNet normalization)
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
normalized = (image - mean * 255) / (std * 255)

# 4. Convert to PyTorch format (C, H, W) with batch
# Output shape: [1, 3, 224, 224]
```

#### TensorFlow Models (Chest X-ray)
```python
# 1. Load image and convert to RGB/Grayscale
image = Image.open(file).convert('RGB')

# 2. Resize to target size (224)
image = image.resize((224, 224), Image.Resampling.LANCZOS)

# 3. Normalize (ImageNet normalization)
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
normalized = (image - mean * 255) / (std * 255)

# 4. Convert to TensorFlow format (H, W, C) with batch
# Output shape: [1, 224, 224, 3]
```

---

## Running the Backend

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start FastAPI server
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Test endpoints
curl http://localhost:8000/api/inference/health
curl http://localhost:8000/api/inference/models

# 4. Send inference requests
# See frontend components for examples
```

---

## Example: Complete Model Integration

### Save Dental Model
```python
import torch
import json

# Your trained model
model = DentalAnomalyModel()
model.eval()

# Save as checkpoint
torch.save({
    'model': model,
    'state_dict': model.state_dict(),
    'metadata': {
        'model_name': 'dental_model',
        'input_shape': [3, 224, 224],
        'output_classes': ['normal', 'caries', 'periapical_lesion', 'impaction', 'bone_loss', 'root_anomaly'],
        'mean': [0.485, 0.456, 0.406],
        'std': [0.229, 0.224, 0.225],
        'input_size': 224,
        'normalize': True,
    }
}, 'backend/models/dental_model.pth')
```

### Test via Dashboard
1. Start backend: `python -m uvicorn app.main:app --reload`
2. Start frontend: `pnpm dev`
3. Navigate to `/dashboard/dental`
4. Upload a dental X-ray image
5. View results

---

## Troubleshooting

### Model Not Loading
- Check file exists at correct path
- Verify metadata is valid JSON
- Check model_name matches expected name

### Inference Errors
- Verify input image format (JPG, PNG)
- Check image is not too large (max 10MB)
- Ensure model is in eval mode for PyTorch

### CUDA/GPU Issues
- Backend automatically detects GPU availability
- Falls back to CPU if CUDA not available
- Check `health` endpoint for GPU status

### Preprocessing Issues
- Verify normalization parameters match training
- Check input size matches model input shape
- Ensure image channels are correct (RGB for dental, RGB or grayscale for chest X-ray)

---

## Format Summary Table

| Framework | Format | Location | Metadata | Model Type |
|-----------|--------|----------|----------|-----------|
| PyTorch | .pth file | `backend/models/dental_model.pth` | In checkpoint | Dental Anomaly |
| PyTorch | .pth file | `backend/models/fracture_model.pth` | In checkpoint | Fracture Detection |
| TensorFlow | SavedModel dir | `backend/models/chest_xray_model/` | metadata.json | Chest X-ray |

---

For more information, see the backend API documentation at `/api/docs` when the server is running.
