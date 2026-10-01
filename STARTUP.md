# Quick Startup Guide

Get the Medical Imaging AI Dashboard running in 5 minutes.

## Step 1: Frontend Setup (Terminal 1)

```bash
# Install dependencies
pnpm install

# Start Next.js dev server
pnpm dev

# ✓ Frontend ready at http://localhost:3000
# The dashboard will redirect to /dashboard automatically
```

## Step 2: Backend Setup (Terminal 2)

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# ✓ Backend ready at http://localhost:8000
# API docs at http://localhost:8000/api/docs
```

## Step 3: Add Your Models

Before you can run inference, you need to add model files:

### Option A: Use Placeholder Models (for testing)

The backend will work without models - just test that the system runs:

```bash
# Check health status
curl http://localhost:8000/api/inference/health
```

You'll get a response showing "loaded_models: []" which is normal.

### Option B: Add Your Real Models

See [MODEL_GUIDE.md](MODEL_GUIDE.md) for detailed instructions.

**Quick summary:**
1. Train/export your models
2. Place dental model at: `backend/models/dental_model.pth`
3. Place chest X-ray model at: `backend/models/chest_xray_model/` (with metadata.json)
4. Restart backend (it auto-loads models)

## Step 4: Test the Dashboard

1. Open http://localhost:3000 in your browser
2. You'll see the main dashboard with:
   - System statistics
   - Quick access cards for each imaging type
   - System status panel

3. Navigate to imaging modules:
   - **Dental** → http://localhost:3000/dashboard/dental
   - **Chest X-ray** → http://localhost:3000/dashboard/chest-xray
   - **Fracture** → http://localhost:3000/dashboard/fracture

## Step 5: Upload & Analyze

1. On any imaging page, click the upload area
2. Drag & drop or select a medical image (JPG, PNG)
3. Wait for analysis (2-5 seconds)
4. View results with confidence scores

## Architecture Overview

```
┌─────────────────────┐
│   Frontend (Port 3000) │
│ Next.js 16 + React    │
└──────────────┬────────┘
               │ HTTP
               ▼
┌─────────────────────────┐
│  Backend (Port 8000)    │
│  FastAPI + Python       │
│  ┌───────────────────┐  │
│  │ Model Registry    │  │
│  │ PyTorch + TF/Keras│  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## Common Issues & Solutions

### "Cannot connect to API"
- [ ] Is backend running on port 8000?
- [ ] Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] Try: `curl http://localhost:8000/`

### "No models loaded"
- [ ] Is this expected? If testing without models, that's OK
- [ ] Check [MODEL_GUIDE.md](MODEL_GUIDE.md) for saving your models
- [ ] Models go in `backend/models/` directory

### "Image upload fails"
- [ ] Image must be <10MB
- [ ] Format must be JPG, PNG, or WebP
- [ ] Check browser console (F12) for errors

### "Port already in use"
- [ ] Find process: `lsof -i :3000` or `lsof -i :8000`
- [ ] Kill process: `kill -9 <PID>`
- [ ] Or use different port: `pnpm dev -- -p 3001`

### "ModuleNotFoundError"
- [ ] Check you're in `backend/` directory before pip install
- [ ] Try: `pip install -r requirements.txt --upgrade`
- [ ] Use venv: `python -m venv venv && source venv/bin/activate`

## Environment Variables

See `.env.local` for current settings:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Frontend → Backend URL
BACKEND_HOST=0.0.0.0                       # Backend listen address
BACKEND_PORT=8000                          # Backend port
CORS_ORIGINS=http://localhost:3000,...     # Allowed origins
```

## File Structure Quick Reference

```
Root/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── page.tsx       # Main dashboard
│   │   ├── dental/        # Dental module
│   │   ├── chest-xray/    # Chest X-ray module
│   │   └── fracture/      # Fracture module
│   └── globals.css        # Hospital color scheme
├── components/
│   ├── dashboard/         # Navigation & headers
│   └── imaging/           # Uploader & results
├── lib/
│   └── api-client.ts      # API communication
├── backend/
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── services/     # Model loading & inference
│   │   └── routers/      # API endpoints
│   ├── models/           # Model storage (add yours here!)
│   └── requirements.txt   # Python dependencies
└── MODEL_GUIDE.md         # How to save your models
```

## Dashboard Features

### Main Dashboard
- Real-time statistics (scans processed, avg time, users, accuracy)
- System status (online/offline, GPU available, loaded models)
- Quick access to each imaging module

### Dental Module
- Drag & drop dental X-ray upload
- Detects: cavities, lesions, impactions, bone loss, anomalies
- Severity assessment (Low/Medium/High)
- Clinical recommendations

### Chest X-ray Module
- Upload frontal or lateral chest X-rays
- Multi-disease detection: Pneumonia, TB, COVID-19, etc.
- Per-disease confidence scores
- Clinical correlation notes

### Fracture Module
- Upload bone X-ray images
- Fracture classification (Hairline/Stable/Displaced)
- Affected bone identification
- Orthopedic recommendations

## Next Steps

1. **Add your models** → See [MODEL_GUIDE.md](MODEL_GUIDE.md)
2. **Test inference** → Upload sample images
3. **Customize** → Modify colors, add classes, change UI
4. **Deploy** → Push to GitHub, deploy on Vercel + cloud VPS

## API Testing

Without the frontend, test API directly:

```bash
# Health check
curl http://localhost:8000/api/inference/health

# List loaded models
curl http://localhost:8000/api/inference/models

# Test with image file
curl -X POST -F "file=@/path/to/image.jpg" \
  http://localhost:8000/api/inference/dental

# View API documentation
# Open http://localhost:8000/api/docs in browser
```

## Development Tips

### Hot Reload
- Frontend: Changes to `.tsx` files reload automatically
- Backend: Changes to `.py` files reload automatically (with `--reload`)

### Debug Logs
- Frontend: Open browser console (F12)
- Backend: Check terminal output where you ran uvicorn

### API Documentation
- Interactive Swagger UI: http://localhost:8000/api/docs
- ReDoc documentation: http://localhost:8000/api/redoc

## Production Deployment

When ready to deploy:

1. **Frontend**: Deploy to Vercel
   - Push to GitHub
   - Connect Vercel
   - Set `NEXT_PUBLIC_API_URL` to production backend URL

2. **Backend**: Deploy to cloud (AWS, DigitalOcean, Heroku)
   - Update CORS origins
   - Configure GPU if available
   - Use gunicorn/uvicorn as ASGI server

See README.md for detailed deployment instructions.

---

**You're all set! Open http://localhost:3000 and start analyzing medical images.**
