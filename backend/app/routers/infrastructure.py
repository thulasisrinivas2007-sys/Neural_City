import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from ..seed_data import SEED_SENSORS, SEED_LOCATIONS
from ..schemas.schemas import SensorOut

router = APIRouter(prefix="/api/infrastructure", tags=["IoT Infrastructure"])

@router.get("/sensors", response_model=List[SensorOut])
def get_sensors():
    # Enrich with location name and dynamic simulated minor fluctuations
    results = []
    loc_map = {l["id"]: l["name"] for l in SEED_LOCATIONS}
    
    for s in SEED_SENSORS:
        val = s["current_value"]
        # Micro variation to simulate live telemetry
        jitter = (random.random() - 0.5) * 0.04 * val
        live_val = round(val + jitter, 2)
        
        results.append({
            "id": s["id"],
            "name": s["name"],
            "sensor_type": s["sensor_type"],
            "location_id": s["location_id"],
            "location_name": loc_map.get(s["location_id"], s["location_id"]),
            "unit": s["unit"],
            "min_threshold": s["min_threshold"],
            "max_threshold": s["max_threshold"],
            "current_value": live_val,
            "status": s["status"],
            "is_active": True
        })
    return results

@router.get("/readings/{sensor_id}")
def get_sensor_readings(sensor_id: str):
    sensor = next((s for s in SEED_SENSORS if s["id"] == sensor_id), None)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    readings = []
    base_time = datetime.utcnow()
    val = sensor["current_value"]

    for i in range(20, 0, -1):
        t = base_time - timedelta(minutes=i * 3)
        v = round(val + (random.random() - 0.5) * 0.08 * val, 2)
        readings.append({
            "timestamp": t.strftime("%H:%M:%S"),
            "value": v,
            "unit": sensor["unit"],
            "status": "WARNING" if (sensor["max_threshold"] and v > sensor["max_threshold"]) else "NORMAL"
        })

    return {
        "sensor": sensor,
        "readings": readings
    }
