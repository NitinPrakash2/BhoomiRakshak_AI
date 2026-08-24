"""BhoomiRakshak ML Inference Service (FastAPI).

Aligned with MASTER_DOCUMENTATION.md:
  - Section 22 / 61: ML is a separate Python/FastAPI service.
  - Section 47 P6: POST /predict, GET /health, GET /model-info.
  - Section 23: prediction response schema (riskScore, riskLevel,
    modelProbability, topFactors, modelVersion).
  - Section 21: explainable AI - topFactors tell WHY an area is at risk.
"""
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from preprocessing.features import FEATURES
from inference import predictor

app = FastAPI(
    title="BhoomiRakshak ML Service",
    version="0.1.0",
    description="Landslide risk estimation / early-warning inference (decision support, not a guarantee).",
)


class PredictionRequest(BaseModel):
    """Allowlisted features (Section 16), all optional-at-schema but the API
    enforces that every FEATURES column is present for a valid prediction."""

    rainfall_1h: Optional[float] = None
    rainfall_6h: Optional[float] = None
    rainfall_24h: Optional[float] = None
    rainfall_72h: Optional[float] = None
    soil_moisture: Optional[float] = None
    elevation: Optional[float] = None
    slope: Optional[float] = None
    aspect: Optional[float] = None
    terrain_ruggedness: Optional[float] = None
    historical_landslide_count: Optional[float] = None
    distance_to_road: Optional[float] = None
    distance_to_river: Optional[float] = None
    geological_risk_indicator: Optional[float] = None
    recent_surface_change: Optional[float] = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-service", "time": datetime.now(timezone.utc).isoformat()}


@app.get("/model-info")
def model_info():
    try:
        _, meta = predictor.load_model()
        return {"success": True, "data": meta}
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/predict")
def predict(req: PredictionRequest):
    payload = req.model_dump()
    missing = [f for f in FEATURES if payload.get(f) is None]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing required features: {missing}")

    try:
        result = predictor.predict(payload)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))