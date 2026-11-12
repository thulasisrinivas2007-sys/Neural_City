from typing import List
from fastapi import APIRouter, HTTPException
from ..seed_data import SEED_LOCATIONS, SEED_ROADS
from ..schemas.schemas import EmergencyRouteRequest, EmergencyRouteOut, RoadClosureRequest
from ..services.routing_service import EmergencyRoutingService

router = APIRouter(prefix="/api/emergency", tags=["Emergency Services"])

# In-memory road state (closures)
active_roads = [dict(r) for r in SEED_ROADS]

@router.post("/route", response_model=EmergencyRouteOut)
def calculate_emergency_route(req: EmergencyRouteRequest):
    router_service = EmergencyRoutingService(SEED_LOCATIONS, active_roads)
    try:
        route_data = router_service.find_emergency_route(
            source_id=req.source_id,
            destination_id=req.destination_id,
            service_type=req.service_type,
            avoid_closed=req.avoid_closed_roads,
            consider_congestion=req.consider_traffic_congestion,
            flood_hazard_nodes=["koramangala", "hebbal"] if req.consider_flood_risk else []
        )
        return route_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/road-closure")
def toggle_road_closure(req: RoadClosureRequest):
    road = next((r for r in active_roads if r["id"] == req.road_id), None)
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    road["is_closed"] = req.is_closed
    road["closure_reason"] = req.closure_reason if req.is_closed else None

    return {
        "status": "SUCCESS",
        "road_id": road["id"],
        "is_closed": road["is_closed"],
        "reason": road.get("closure_reason")
    }
