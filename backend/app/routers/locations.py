from typing import List
from fastapi import APIRouter
from ..seed_data import SEED_LOCATIONS, SEED_ROADS
from ..schemas.schemas import LocationOut, RoadOut

router = APIRouter(prefix="/api", tags=["GIS & Topology"])

@router.get("/locations", response_model=List[LocationOut])
def get_locations():
    return SEED_LOCATIONS

@router.get("/roads", response_model=List[RoadOut])
def get_roads():
    return SEED_ROADS
