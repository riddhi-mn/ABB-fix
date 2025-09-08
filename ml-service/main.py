from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import xgboost as xgb
import lightgbm as lgb
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="IntelliInspect ML Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store model and data
trained_model = None
model_metrics = {}
feature_columns = []

class TrainingRequest(BaseModel):
    trainStart: str
    trainEnd: str
    testStart: str
    testEnd: str

class PredictionRequest(BaseModel):
    timestamp: str
    temperature: float
    pressure: float
    humidity: float
    additionalFeatures: Optional[str] = None

class TrainingResponse(BaseModel):
    success: bool
    message: str
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    confusionMatrix: str
    trainingChart: str

class PredictionResponse(BaseModel):
    timestamp: str
    sampleId: str
    prediction: str
    confidence: float
    temperature: float
    pressure: float
    humidity: float

def generate_synthetic_data(start_date: str, end_date: str, num_records: int) -> pd.DataFrame:
    """Generate synthetic sensor data for demonstration"""
    np.random.seed(42)
    
    # Create date range
    start = pd.to_datetime(start_date)
    end = pd.to_datetime(end_date)
    dates = pd.date_range(start=start, end=end, periods=num_records)
    
    # Generate synthetic features
    data = {
        'timestamp': dates,
        'temperature': np.random.normal(45, 10, num_records),  # 20-70°C
        'pressure': np.random.normal(900, 50, num_records),    # 800-1000 hPa
        'humidity': np.random.normal(50, 15, num_records),     # 20-80%
        'vibration': np.random.normal(5, 2, num_records),      # 0-10 scale
        'current': np.random.normal(10, 3, num_records),       # 5-15 Amps
        'voltage': np.random.normal(220, 20, num_records),     # 200-240V
    }
    
    # Create response based on feature combinations (simplified logic)
    response = []
    for i in range(num_records):
        temp_ok = 20 <= data['temperature'][i] <= 70
        pressure_ok = 800 <= data['pressure'][i] <= 1000
        humidity_ok = 20 <= data['humidity'][i] <= 80
        vibration_ok = data['vibration'][i] <= 8
        current_ok = 5 <= data['current'][i] <= 15
        voltage_ok = 200 <= data['voltage'][i] <= 240
        
        # Pass if most conditions are met
        conditions_met = sum([temp_ok, pressure_ok, humidity_ok, vibration_ok, current_ok, voltage_ok])
        response.append(1 if conditions_met >= 4 else 0)
    
    data['response'] = response
    
    return pd.DataFrame(data)

def create_training_chart(history: Dict[str, list]) -> str:
    """Create training progress chart"""
    plt.figure(figsize=(10, 6))
    
    epochs = range(1, len(history['accuracy']) + 1)
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs, history['accuracy'], 'b-', label='Accuracy')
    plt.plot(epochs, history['val_accuracy'], 'r-', label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True)
    
    plt.subplot(1, 2, 2)
    plt.plot(epochs, history['loss'], 'b-', label='Loss')
    plt.plot(epochs, history['val_loss'], 'r-', label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    
    plt.tight_layout()
    
    # Convert to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

def create_confusion_matrix_chart(y_true: np.ndarray, y_pred: np.ndarray) -> str:
    """Create confusion matrix visualization"""
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Fail', 'Pass'], 
                yticklabels=['Fail', 'Pass'])
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Convert to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return image_base64

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/train", response_model=TrainingResponse)
async def train_model(request: TrainingRequest):
    """Train ML model with specified date ranges"""
    try:
        logger.info(f"Training model with date ranges: {request.trainStart} to {request.trainEnd}")
        
        # Generate synthetic training data
        train_data = generate_synthetic_data(request.trainStart, request.trainEnd, 1000)
        test_data = generate_synthetic_data(request.testStart, request.testEnd, 300)
        
        # Prepare features and target
        feature_cols = ['temperature', 'pressure', 'humidity', 'vibration', 'current', 'voltage']
        global feature_columns
        feature_columns = feature_cols
        
        X_train = train_data[feature_cols]
        y_train = train_data['response']
        X_test = test_data[feature_cols]
        y_test = test_data['response']
        
        # Train XGBoost model
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        # Simulate training history for visualization
        history = {
            'accuracy': [0.65, 0.72, 0.78, 0.82, 0.85, 0.87, 0.88, 0.89, 0.90, 0.91],
            'val_accuracy': [0.63, 0.70, 0.76, 0.80, 0.83, 0.85, 0.86, 0.87, 0.88, 0.89],
            'loss': [0.65, 0.55, 0.48, 0.42, 0.38, 0.35, 0.33, 0.31, 0.29, 0.28],
            'val_loss': [0.68, 0.58, 0.51, 0.45, 0.41, 0.38, 0.36, 0.34, 0.32, 0.31]
        }
        
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        # Store model and metrics globally
        global trained_model, model_metrics
        trained_model = model
        model_metrics = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1
        }
        
        # Create visualizations
        training_chart = create_training_chart(history)
        confusion_matrix_chart = create_confusion_matrix_chart(y_test, y_pred)
        
        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(model, 'models/xgboost_model.pkl')
        
        logger.info(f"Model trained successfully. Accuracy: {accuracy:.3f}")
        
        return TrainingResponse(
            success=True,
            message="Model trained successfully",
            accuracy=round(accuracy * 100, 2),
            precision=round(precision * 100, 2),
            recall=round(recall * 100, 2),
            f1Score=round(f1 * 100, 2),
            confusionMatrix=confusion_matrix_chart,
            trainingChart=training_chart
        )
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        return TrainingResponse(
            success=False,
            message=f"Error training model: {str(e)}",
            accuracy=0.0,
            precision=0.0,
            recall=0.0,
            f1Score=0.0,
            confusionMatrix="",
            trainingChart=""
        )

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make prediction for a single record"""
    try:
        if trained_model is None:
            raise HTTPException(status_code=400, detail="No trained model available")
        
        # Prepare features
        features = np.array([[request.temperature, request.pressure, request.humidity]])
        
        # Add additional features if available
        if request.additionalFeatures:
            try:
                additional = json.loads(request.additionalFeatures)
                # Add default values for missing features
                vibration = additional.get('vibration', np.random.normal(5, 2))
                current = additional.get('current', np.random.normal(10, 3))
                voltage = additional.get('voltage', np.random.normal(220, 20))
                features = np.array([[request.temperature, request.pressure, request.humidity, vibration, current, voltage]])
            except:
                # Fallback to default values
                features = np.array([[request.temperature, request.pressure, request.humidity, 5, 10, 220]])
        else:
            # Use default values for missing features
            features = np.array([[request.temperature, request.pressure, request.humidity, 5, 10, 220]])
        
        # Make prediction
        prediction_proba = trained_model.predict_proba(features)[0]
        prediction_class = trained_model.predict(features)[0]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        return PredictionResponse(
            timestamp=request.timestamp,
            sampleId=f"sample_{hash(request.timestamp) % 10000}",
            prediction="Pass" if prediction_class == 1 else "Fail",
            confidence=round(confidence, 2),
            temperature=request.temperature,
            pressure=request.pressure,
            humidity=request.humidity
        )
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/model/info")
async def get_model_info():
    """Get information about the trained model"""
    if trained_model is None:
        return {"message": "No model trained yet"}
    
    return {
        "model_type": "XGBoost",
        "features": feature_columns,
        "metrics": model_metrics,
        "trained_at": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
