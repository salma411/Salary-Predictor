import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import pandas as pd
import joblib
import numpy as np

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("salary-predictor-api")

app = FastAPI(
    title="Salary Predictor API",
    description="Professional API for predicting AI job salaries.",
    version="1.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "salary_predictor_model.pkl")

try: 
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    logger.info("✅ Model loaded successfully from %s", MODEL_PATH)
except Exception as e:
    logger.error("❌ Failed to load model: %s", str(e))
    model = None

class SalaryInput(BaseModel):
    job_title: str = Field(..., example="Machine Learning Engineer")
    experience_level: str = Field(..., example="SE", description="EN / MI / SE / EX")
    employment_type: str = Field(..., example="FT", description="FT / PT / CT / FL")
    company_location: str = Field(..., example="United States")
    company_size: str = Field(..., example="M", description="S / M / L")
    employee_residence: str = Field(..., example="United States")
    remote_ratio: int = Field(..., example=100, ge=0, le=100)
    required_skills: str = Field(..., example="Python, TensorFlow, AWS")
    education_required: str = Field(..., example="Master")
    years_experience: float = Field(..., example=4, ge=0)
    industry: str = Field(..., example="Technology")
    job_description_length: int = Field(..., example=1500, ge=0)
    benefits_score: float = Field(..., example=8, ge=0, le=10)

class SalaryOutput(BaseModel):
    predicted_salary_usd: float
    currency: str = "USD"
    model_version: str = "1.1.0"
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

def build_feature_df(data: SalaryInput) -> pd.DataFrame:
    now = datetime.now()
    # Cap year at 2025 as the model hasn't seen 2026 data and might extrapolate negatively
    prediction_year = min(now.year, 2025)
    
    row = {
        "job_title": data.job_title,
        "experience_level": data.experience_level,
        "employment_type": data.employment_type,
        "company_location": data.company_location,
        "company_size": data.company_size,
        "employee_residence": data.employee_residence,
        "remote_ratio": data.remote_ratio,
        "required_skills": data.required_skills,
        "education_required": data.education_required,
        "years_experience": data.years_experience,
        "industry": data.industry,
        "job_description_length": data.job_description_length,
        "benefits_score": data.benefits_score,
        "posting_month": now.month,
        "posting_year": prediction_year,
        "skills_count": len([s.strip() for s in data.required_skills.split(",") if s.strip()]),
    }
    return pd.DataFrame([row])

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Salary Predictor API is ready 🚀",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        } 
    }

@app.get("/health")
def health():
    if model is None:
        return {"status": "unhealthy", "error": "Model not loaded"}
    return {"status": "healthy", "model_loaded": True}

@app.post("/predict", response_model=SalaryOutput)
def predict(data: SalaryInput):
    if model is None:
        logger.error("Prediction attempt with unloaded model")
        raise HTTPException(status_code=503, detail="Model not initialized")
    
    try:
        logger.info("Processing prediction for title: %s", data.job_title)
        df = build_feature_df(data)
        
        # Log input features for debugging
        logger.info("Input Features: %s", df.to_dict(orient='records')[0])
        
        raw_prediction = model.predict(df)[0]
        logger.info("Raw Model Prediction: %f", raw_prediction)
        
        # Ensure result is within logical bounds
        # If the model still predicts 0 or negative, it might be due to feature mismatch
        salary = float(np.clip(raw_prediction, 0, 2_000_000))
        
        return SalaryOutput(predicted_salary_usd=round(salary, 2))
    except Exception as e:
        logger.error("Prediction error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Use the package-style import for reload to work correctly
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

