from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, default="hub") # hub, residential, commercial, industrial
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, default=900.0) # meters above sea level
    ward_number = Column(Integer, nullable=True)
    population_density = Column(Integer, default=12000)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    traffic_readings = relationship("TrafficReading", back_populates="location")
    flood_observations = relationship("FloodObservation", back_populates="location")
    sensors = relationship("InfrastructureSensor", back_populates="location")
    alerts = relationship("Alert", back_populates="location")

class Road(Base):
    __tablename__ = "roads"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    source_location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    target_location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    distance_km = Column(Float, nullable=False)
    speed_limit_kmh = Column(Float, default=50.0)
    capacity_vph = Column(Integer, default=3000) # vehicles per hour
    lanes = Column(Integer, default=4)
    is_closed = Column(Boolean, default=False)
    closure_reason = Column(String, nullable=True)
    current_congestion = Column(Float, default=0.2) # 0.0 to 1.0

class TrafficReading(Base):
    __tablename__ = "traffic_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    vehicle_count = Column(Integer, nullable=False)
    average_speed_kmh = Column(Float, nullable=False)
    congestion_level = Column(Float, nullable=False) # 0.0 - 1.0
    status = Column(String, default="NORMAL") # NORMAL, MODERATE, SEVERE
    simulated = Column(Boolean, default=True)

    location = relationship("Location", back_populates="traffic_readings")

class TrafficPrediction(Base):
    __tablename__ = "traffic_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    forecast_horizon_hours = Column(Integer, nullable=False)
    predicted_congestion = Column(Float, nullable=False)
    predicted_speed = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.88)
    model_version = Column(String, default="v1.2-random-forest")
    created_at = Column(DateTime, default=datetime.utcnow)

class FloodObservation(Base):
    __tablename__ = "flood_observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    rainfall_mm = Column(Float, nullable=False)
    water_level_m = Column(Float, nullable=False)
    drainage_capacity_pct = Column(Float, nullable=False)
    risk_level = Column(String, default="LOW") # LOW, MODERATE, HIGH, CRITICAL
    simulated = Column(Boolean, default=True)

    location = relationship("Location", back_populates="flood_observations")

class FloodPrediction(Base):
    __tablename__ = "flood_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    predicted_risk_level = Column(String, nullable=False)
    risk_probability = Column(Float, nullable=False)
    drainage_blockage_factor = Column(Float, default=0.2)
    rainfall_intensity = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.91)
    created_at = Column(DateTime, default=datetime.utcnow)

class InfrastructureSensor(Base):
    __tablename__ = "infrastructure_sensors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sensor_type = Column(String, nullable=False) # WATER_LEVEL, WATER_PRESSURE, WATER_FLOW, POWER_VOLTAGE, POWER_LOAD, TRANSFORMER_TEMP
    location_id = Column(String, ForeignKey("locations.id"), nullable=False)
    unit = Column(String, nullable=False) # m, bar, L/min, V, %, °C
    min_threshold = Column(Float, nullable=True)
    max_threshold = Column(Float, nullable=True)
    current_value = Column(Float, default=0.0)
    status = Column(String, default="NORMAL") # NORMAL, WARNING, CRITICAL
    is_active = Column(Boolean, default=True)

    location = relationship("Location", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sensor_id = Column(String, ForeignKey("infrastructure_sensors.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    value = Column(Float, nullable=False)
    status = Column(String, default="NORMAL")
    simulated = Column(Boolean, default=True)

    sensor = relationship("InfrastructureSensor", back_populates="readings")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    location_id = Column(String, ForeignKey("locations.id"), nullable=True)
    alert_type = Column(String, nullable=False) # TRAFFIC_GRIDLOCK, FLOOD_SURGE, WATER_LEAK, POWER_OVERLOAD, INFRASTRUCTURE_FAILURE
    severity = Column(String, default="WARNING") # INFO, WARNING, CRITICAL
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String, nullable=True)

    location = relationship("Location", back_populates="alerts")

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rainfall_intensity = Column(Float, default=0.0) # mm/h
    drainage_capacity = Column(Float, default=80.0) # %
    traffic_volume_multiplier = Column(Float, default=1.0)
    water_demand_multiplier = Column(Float, default=1.0)
    electricity_demand_multiplier = Column(Float, default=1.0)
    closed_roads = Column(JSON, default=list)
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmergencyRouteLog(Base):
    __tablename__ = "emergency_routes"

    id = Column(String, primary_key=True, index=True)
    service_type = Column(String, default="AMBULANCE") # AMBULANCE, FIRE_BRIGADE, RESCUE_SQUAD
    source_id = Column(String, nullable=False)
    destination_id = Column(String, nullable=False)
    path_nodes = Column(JSON, nullable=False)
    total_distance_km = Column(Float, nullable=False)
    estimated_time_mins = Column(Float, nullable=False)
    avoided_roads = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
