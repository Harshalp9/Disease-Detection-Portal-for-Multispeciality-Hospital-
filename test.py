from ultralytics import YOLO

# Load the model you just downloaded
model = YOLO("backend/models/fracture_model/best.pt")

# Print the categories
print("This model detects:", model.names)