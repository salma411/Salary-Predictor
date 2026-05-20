# ============================================================
# SALARY PREDICTOR — FastAPI Backend
# ============================================================
# Run with:  uvicorn app:app --reload
# Docs at:   http://127.0.0.1:8000/docs
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from datetime import datetime
import pandas as pd
import joblib
import numpy as np

# ── App setup ────────────────────────────────────────────────

app = FastAPI(
    title="Salary Predictor API",
    description="Predicts salary in USD given job details.",
    version="1.0.0"
)

# Allow requests from your React / Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model once at startup ────────────────────────────────

try:
    model = joblib.load("salary_predictor_model.pkl")
    print("✅  Model loaded successfully")
except FileNotFoundError:
    raise RuntimeError(
        "salary_predictor_model.pkl not found. "
        "Run your training notebook first."
    )


# ── Request / Response schemas ────────────────────────────────

class SalaryInput(BaseModel):
    job_title: str               = Field(...,  example="Machine Learning Engineer")
    experience_level: str        = Field(...,  example="SE",          description="EN / MI / SE / EX")
    employment_type: str         = Field(...,  example="FT",          description="FT / PT / CT / FL")
    company_location: str        = Field(...,  example="United States")
    company_size: str            = Field(...,  example="M",           description="S / M / L")
    employee_residence: str      = Field(...,  example="United States")
    remote_ratio: int            = Field(...,  example=100,           ge=0, le=100)
    required_skills: str         = Field(...,  example="Python, TensorFlow, AWS")
    education_required: str      = Field(...,  example="Master")
    years_experience: float      = Field(...,  example=4,             ge=0)
    industry: str                = Field(...,  example="Technology")
    job_description_length: int  = Field(...,  example=1500,          ge=0)
    benefits_score: float        = Field(...,  example=8,             ge=0, le=10)

    # These are computed automatically — user never sends them
    # posting_month, posting_year, skills_count are derived below


class SalaryOutput(BaseModel):
    predicted_salary_usd: float
    currency: str = "USD"
    model_version: str = "1.0.0"


# ── Helper: build the DataFrame the model expects ────────────

def build_feature_df(data: SalaryInput) -> pd.DataFrame:
    now = datetime.now()

    row = {
        # Raw features from user input
        "job_title":              data.job_title,
        "experience_level":       data.experience_level,
        "employment_type":        data.employment_type,
        "company_location":       data.company_location,
        "company_size":           data.company_size,
        "employee_residence":     data.employee_residence,
        "remote_ratio":           data.remote_ratio,
        "required_skills":        data.required_skills,
        "education_required":     data.education_required,
        "years_experience":       data.years_experience,
        "industry":               data.industry,
        "job_description_length": data.job_description_length,
        "benefits_score":         data.benefits_score,

        # Derived features (match training notebook exactly)
        "posting_month":  now.month,
        "posting_year":   now.year,
        "skills_count":   len([s.strip() for s in data.required_skills.split(",") if s.strip()]),
    }

    return pd.DataFrame([row])


# ── Routes ────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "Salary Predictor API is running 🚀",
        "docs": "/docs",
        "predict": "/predict"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=SalaryOutput)
def predict(data: SalaryInput):
    try:
        df = build_feature_df(data)
        raw_prediction = model.predict(df)[0]

        # Guard against negative / obviously wrong predictions
        salary = float(np.clip(raw_prediction, 0, 1_000_000))

        return SalaryOutput(predicted_salary_usd=round(salary, 2))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Run directly (optional — prefer uvicorn CLI) ──────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)