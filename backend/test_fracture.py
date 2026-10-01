import sys
import os
from ultralytics import YOLO
import cv2

# Path to your new YOLO11 model
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "models", "fracture_model", "best.pt")


def test_inference(image_path):
    # 1. Load the model
    print(f"--- Loading Model: {MODEL_PATH} ---")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
    
    # 2. Check labels (to see if it supports Femur, Tibia, etc.)
    print("Detected Classes:", model.names)
    
    # 3. Run Inference
    # Note: We use 'save=True' so YOLO will automatically create a folder 
    # with the red boxes drawn on the image for you to see.
    print(f"--- Running Inference on: {image_path} ---")
    results = model.predict(source=image_path, conf=0.25, save=True)
    
    # 4. Print results to terminal
    result = results[0]
    if len(result.boxes) > 0:
        print(f"✅ SUCCESS: Found {len(result.boxes)} detections!")
        for box in result.boxes:
            label = model.names[int(box.cls[0])]
            conf = float(box.conf[0])
            print(f"- {label}: {conf*100:.2f}% confidence")
    else:
        print("❌ NO FRACTURE DETECTED (or confidence too low).")

if __name__ == "__main__":
    # Change 'test_xray.jpg' to the name of an actual image in your folder
    test_image = os.path.join(SCRIPT_DIR, "FracturedArm.jpeg")
    test_inference(test_image)