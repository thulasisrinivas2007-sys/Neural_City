from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter
from ..seed_data import SEED_LOCATIONS, SEED_ROADS, SEED_SENSORS
from ..schemas.schemas import SimulationRunRequest, SimulationResultOut
from ..services.simulation_service import simulation_service

router = APIRouter(prefix="/api/simulation", tags=["What-If Simulation"])

# In-memory history of run simulations
simulation_history: List[Dict[str, Any]] = []

@router.post("/run", response_model=SimulationResultOut)
def run_simulation(req: SimulationRunRequest):
    result = simulation_service.run_simulation(
        scenario_name=req.scenario_name,
        rainfall_intensity_mm=req.rainfall_intensity_mm,
        drainage_capacity_pct=req.drainage_capacity_pct,
        traffic_surge_factor=req.traffic_surge_factor,
        water_demand_factor=req.water_demand_factor,
        electricity_demand_factor=req.electricity_demand_factor,
        simulated_road_closures=req.simulated_road_closures,
        locations=SEED_LOCATIONS,
        roads=SEED_ROADS,
        sensors=SEED_SENSORS
    )
    simulation_history.insert(0, result)
    return result

@router.get("/history", response_model=List[SimulationResultOut])
def get_simulation_history():
    return simulation_history[:10]
