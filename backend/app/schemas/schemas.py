from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class LocationBase(BaseModel):
    id: str
    name: str
    category: str
    latitude: float
    longitude: float
    elevation: float
    ward_number: Optional[int] = None
    population_density: int

class LocationOut(LocationBase):
    current_congestion: Optional[float] = 0.0
    current_flood_risk: Optional[str] = "LOW"
    sensor_count: Optional[int] = 0
    active_alerts_count: Optional[int] = 0

    class Config:
        from_attributes = True

class RoadBase(BaseModel):
    id: str
    name: str
    source_location_id: str
    target_location_id: str
    distance_km: float
    speed_limit_kmh: float
    capacity_vph: int
    lanes: int
    is_closed: bool = False
    closure_reason: Optional[str] = None
    current_congestion: float = 0.2

class RoadOut(RoadBase):
    class Config:
        from_attributes = True

class RoadClosureRequest(BaseModel):
    road_id: str
    is_closed: bool
    closure_reason: Optional[str] = "Emergency flood protocol or road maintenance"

class TrafficPredictRequest(BaseModel):
    location_id: str
    horizon_hours: int = Field(default=1, ge=1, le=24)
    simulated_weather_rain_mm: Optional[float] = 0.0
    is_peak_hour: Optional[bool] = False

class TrafficPredictionOut(BaseModel):
    location_id: str
    location_name: str
    horizon_hours: int
    current_congestion: float
    predicted_congestion: float
    predicted_speed_kmh: float
    trend: str # INCREASING, STABLE, DECREASING
    confidence_score: float
    model_metrics: Dict[str, float]
    historical_comparison: List[Dict[str, Any]]

class FloodPredictRequest(BaseModel):
    location_id: str
    rainfall_mm_per_hour: float = Field(default=25.0, ge=0.0, le=250.0)
    drainage_capacity_pct: float = Field(default=75.0, ge=5.0, le=100.0)
    antecedent_precipitation_days: Optional[int] = 2

class FloodPredictionOut(BaseModel):
    location_id: str
    location_name: str
    elevation_m: float
    rainfall_mm: float
    drainage_capacity_pct: float
    predicted_risk_level: str # LOW, MODERATE, HIGH, CRITICAL
    risk_probability: float
    water_accumulation_depth_cm: float
    contributing_factors: List[Dict[str, Any]]
    confidence_score: float

class SensorOut(BaseModel):
    id: str
    name: str
    sensor_type: str
    location_id: str
    location_name: Optional[str] = None
    unit: str
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None
    current_value: float
    status: str
    is_active: bool

class SensorReadingOut(BaseModel):
    sensor_id: str
    timestamp: datetime
    value: float
    status: str

class AlertOut(BaseModel):
    id: str
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    alert_type: str
    severity: str
    title: str
    description: str
    timestamp: datetime
    is_acknowledged: bool
    acknowledged_by: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    alert_id: str
    acknowledged_by: Optional[str] = "Operator-Central"

class EmergencyRouteRequest(BaseModel):
    service_type: str = "AMBULANCE" # AMBULANCE, FIRE_TRUCK, RESCUE_SQUAD
    source_id: str
    destination_id: str
    avoid_closed_roads: bool = True
    consider_traffic_congestion: bool = True
    consider_flood_risk: bool = True

class EmergencyRouteOut(BaseModel):
    service_type: str
    source_id: str
    destination_id: str
    path_nodes: List[Dict[str, Any]]
    route_polyline: List[List[float]]
    total_distance_km: float
    estimated_time_mins: float
    congestion_delay_mins: float
    avoided_hazards: List[str]
    road_segments: List[Dict[str, Any]]

class SimulationRunRequest(BaseModel):
    scenario_name: str = "Monsoon Flash Flood & Peak Surge"
    rainfall_intensity_mm: float = Field(default=65.0, ge=0.0, le=200.0)
    drainage_capacity_pct: float = Field(default=45.0, ge=10.0, le=100.0)
    traffic_surge_factor: float = Field(default=1.4, ge=0.5, le=3.0)
    water_demand_factor: float = Field(default=1.1, ge=0.5, le=2.5)
    electricity_demand_factor: float = Field(default=1.2, ge=0.5, le=2.5)
    simulated_road_closures: List[str] = []

class SimulationResultOut(BaseModel):
    scenario_id: str
    timestamp: datetime
    inputs: Dict[str, Any]
    baseline_health_score: float
    simulated_health_score: float
    health_score_delta: float
    affected_locations_count: int
    at_risk_population: int
    cascade_chain: List[str]
    flood_impacts: List[Dict[str, Any]]
    traffic_impacts: List[Dict[str, Any]]
    power_water_impacts: List[Dict[str, Any]]
    rerouted_emergency_paths: int

class DashboardOverviewOut(BaseModel):
    monitored_locations_count: int
    average_traffic_congestion_pct: float
    traffic_status: str
    high_flood_risk_zones_count: int
    flood_status: str
    water_infrastructure_health_pct: float
    electricity_infrastructure_health_pct: float
    active_critical_alerts_count: int
    active_warning_alerts_count: int
    city_health_score: float
    system_mode: str
    telemetry_timestamp: datetime
    quick_trends: Dict[str, Any]
