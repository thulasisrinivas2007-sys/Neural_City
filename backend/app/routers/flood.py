from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from ..seed_data import SEED_LOCATIONS
from ..schemas.schemas import FloodPredictRequest, FloodPredictionOut
from ..ml.flood_model import flood_model

router = APIRouter(prefix="/api/flood", tags=["AI Flood Risk"])

@router.get("/locations")
def get_flood_locations():
    results = []
    for loc in SEED_LOCATIONS:
        elev = loc.get("elevation", 900.0)
        # Default baseline condition: light rain 15mm/h, drainage 70%
        pred = flood_model.predict(
            elevation_m=elev,
            rainfall_mm_h=18.0,
            drainage_capacity_pct=72.0
        )
        results.append({
            "location_id": loc["id"],
            "location_name": loc["name"],
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "elevation_m": elev,
            "risk_level": pred["predicted_risk_level"],
            "risk_probability": pred["risk_probability"],
            "water_accumulation_depth_cm": pred["water_accumulation_depth_cm"],
            "drainage_capacity_pct": 72.0
        })
    return results

@router.post("/predict", response_model=FloodPredictionOut)
def predict_flood_risk(req: FloodPredictRequest):
    loc = next((l for l in SEED_LOCATIONS if l["id"] == req.location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    pred = flood_model.predict(
        elevation_m=loc.get("elevation", 900.0),
        rainfall_mm_h=req.rainfall_mm_per_hour,
        drainage_capacity_pct=req.drainage_capacity_pct,
        antecedent_days=req.antecedent_precipitation_days or 2
    )

    return {
        "location_id": loc["id"],
        "location_name": loc["name"],
        "elevation_m": loc.get("elevation", 900.0),
        "rainfall_mm": req.rainfall_mm_per_hour,
        "drainage_capacity_pct": req.drainage_capacity_pct,
        "predicted_risk_level": pred["predicted_risk_level"],
        "risk_probability": pred["risk_probability"],
        "water_accumulation_depth_cm": pred["water_accumulation_depth_cm"],
        "contributing_factors": pred["contributing_factors"],
        "confidence_score": pred["confidence_score"]
    }
