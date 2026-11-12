from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from ..seed_data import SEED_LOCATIONS, SEED_ROADS
from ..schemas.schemas import TrafficPredictRequest, TrafficPredictionOut
from ..ml.traffic_model import traffic_model

router = APIRouter(prefix="/api/traffic", tags=["AI Traffic"])

@router.get("/current")
def get_current_traffic():
    results = []
    for loc in SEED_LOCATIONS:
        # Calculate nearby corridor congestion average
        connected_roads = [r for r in SEED_ROADS if r["source_location_id"] == loc["id"] or r["target_location_id"] == loc["id"]]
        avg_cong = sum(r["current_congestion"] for r in connected_roads) / max(1, len(connected_roads))
        vehicle_count = int(1200 + avg_cong * 2400)
        avg_speed = round(52.0 * (1.0 - avg_cong ** 1.3) + 8.0, 1)

        results.append({
            "location_id": loc["id"],
            "location_name": loc["name"],
            "congestion_level": round(avg_cong, 2),
            "vehicle_count": vehicle_count,
            "average_speed_kmh": avg_speed,
            "status": "SEVERE" if avg_cong > 0.75 else ("MODERATE" if avg_cong > 0.45 else "SMOOTH"),
            "timestamp": datetime.utcnow()
        })
    return results

@router.get("/history/{location_id}")
def get_traffic_history(location_id: str):
    loc = next((l for l in SEED_LOCATIONS if l["id"] == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # 24 hour historical readings
    history = []
    base_time = datetime.utcnow()
    for i in range(24, 0, -2):
        hist_time = base_time - timedelta(hours=i)
        hour = hist_time.hour
        # Diurnal pattern
        peak_factor = 0.85 if hour in [8, 9, 10, 17, 18, 19, 20] else 0.35
        cong = round(min(0.95, max(0.12, peak_factor + (hash(location_id + str(i)) % 20) / 100.0)), 2)
        history.append({
            "timestamp": hist_time.strftime("%H:%M"),
            "congestion_level": cong,
            "speed_kmh": round(50.0 * (1.0 - cong) + 10.0, 1),
            "vehicle_volume": int(800 + cong * 2600)
        })
    return {"location_id": location_id, "location_name": loc["name"], "readings": history}

@router.post("/predict", response_model=TrafficPredictionOut)
def predict_traffic(req: TrafficPredictRequest):
    loc = next((l for l in SEED_LOCATIONS if l["id"] == req.location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    connected_roads = [r for r in SEED_ROADS if r["source_location_id"] == loc["id"] or r["target_location_id"] == loc["id"]]
    base_cong = sum(r["current_congestion"] for r in connected_roads) / max(1, len(connected_roads))

    pred = traffic_model.predict(
        base_congestion=base_cong,
        horizon_hours=req.horizon_hours,
        rainfall_mm=req.simulated_weather_rain_mm or 0.0,
        is_peak=req.is_peak_hour or False
    )

    # 6-step horizon forecast curve for visual comparison
    forecast_curve = []
    for h in [1, 2, 4, 6, 8, 12]:
        step = traffic_model.predict(base_cong, h, req.simulated_weather_rain_mm or 0.0)
        forecast_curve.append({
            "horizon_hours": h,
            "predicted_congestion": step["predicted_congestion"],
            "speed_kmh": step["predicted_speed_kmh"]
        })

    return {
        "location_id": loc["id"],
        "location_name": loc["name"],
        "horizon_hours": req.horizon_hours,
        "current_congestion": round(base_cong, 2),
        "predicted_congestion": pred["predicted_congestion"],
        "predicted_speed_kmh": pred["predicted_speed_kmh"],
        "trend": pred["trend"],
        "confidence_score": pred["confidence_score"],
        "model_metrics": pred["model_metrics"],
        "historical_comparison": forecast_curve
    }
