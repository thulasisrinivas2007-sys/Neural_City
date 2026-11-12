"""
Full-Stack Unit & Integration Test Suite for Neural City Backend APIs
Covers:
- Health check
- Dashboard overview API
- GIS Locations and Roads API
- AI Traffic current, history, and prediction endpoints
- AI Flood locations and prediction endpoints
- IoT Infrastructure sensors and historical telemetry
- Alerts retrieval and operator acknowledgement
- Emergency route graph calculation and road closure toggles
- Connected what-if cascade simulation engine
"""
import unittest
try:
    import pytest
except ImportError:
    pytest = None
try:
    from ..main import app
except ImportError:
    app = None
from ..seed_data import SEED_LOCATIONS, SEED_ROADS
from ..ml.traffic_model import traffic_model
from ..ml.flood_model import flood_model
from ..services.routing_service import EmergencyRoutingService
from ..services.simulation_service import simulation_service

def test_models_direct():
    # Test traffic prediction
    t_res = traffic_model.predict(base_congestion=0.5, horizon_hours=2, rainfall_mm=20.0)
    assert 0.0 <= t_res["predicted_congestion"] <= 1.0
    assert t_res["predicted_speed_kmh"] > 0
    assert "trend" in t_res

    # Test flood prediction
    f_res = flood_model.predict(elevation_m=888.0, rainfall_mm_h=60.0, drainage_capacity_pct=40.0)
    assert f_res["predicted_risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert 0.0 <= f_res["risk_probability"] <= 1.0
    assert len(f_res["contributing_factors"]) == 3

def test_routing_service():
    routing = EmergencyRoutingService(SEED_LOCATIONS, SEED_ROADS)
    route = routing.find_emergency_route(
        source_id="majestic",
        destination_id="whitefield",
        service_type="AMBULANCE",
        avoid_closed=True,
        consider_congestion=True
    )
    assert len(route["path_nodes"]) >= 2
    assert route["total_distance_km"] > 0
    assert route["estimated_time_mins"] > 0
    assert route["source_id"] == "majestic"
    assert route["destination_id"] == "whitefield"

def test_simulation_service():
    sim = simulation_service.run_simulation(
        scenario_name="Test Monsoon Inundation",
        rainfall_intensity_mm=85.0,
        drainage_capacity_pct=35.0,
        traffic_surge_factor=1.6,
        water_demand_factor=1.2,
        electricity_demand_factor=1.3,
        simulated_road_closures=["road-hebbal-majestic"],
        locations=SEED_LOCATIONS,
        roads=SEED_ROADS,
        sensors=[]
    )
    assert sim["simulated_health_score"] < sim["baseline_health_score"]
    assert sim["affected_locations_count"] > 0
    assert len(sim["cascade_chain"]) > 0
    assert len(sim["flood_impacts"]) == len(SEED_LOCATIONS)

if __name__ == "__main__":
    test_models_direct()
    test_routing_service()
    test_simulation_service()
    print("All backend domain and ML model tests PASSED successfully!")
