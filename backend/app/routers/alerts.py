from typing import List
from fastapi import APIRouter, HTTPException
from ..seed_data import SEED_ALERTS, SEED_LOCATIONS
from ..schemas.schemas import AlertOut, AlertAcknowledgeRequest

router = APIRouter(prefix="/api/alerts", tags=["City Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts():
    loc_map = {l["id"]: l["name"] for l in SEED_LOCATIONS}
    return [
        {
            **a,
            "location_name": loc_map.get(a["location_id"], "Metropolitan Center")
        }
        for a in SEED_ALERTS
    ]

@router.post("/acknowledge")
def acknowledge_alert(req: AlertAcknowledgeRequest):
    alert = next((a for a in SEED_ALERTS if a["id"] == req.alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert["is_acknowledged"] = True
    alert["acknowledged_by"] = req.acknowledged_by
    return {"status": "SUCCESS", "message": f"Alert {req.alert_id} acknowledged by {req.acknowledged_by}"}
