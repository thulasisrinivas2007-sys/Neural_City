-- ========================================================
-- PROJECT NEURAL CITY – SUPABASE POSTGRESQL SCHEMA DDL
-- Complete 11 Tables with Primary Keys, Foreign Keys,
-- Timestamps, Indexes, and Default Seeds
-- ========================================================

-- 1. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'hub',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation DOUBLE PRECISION DEFAULT 900.0,
    ward_number INTEGER,
    population_density INTEGER DEFAULT 12000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROADS TABLE
CREATE TABLE IF NOT EXISTS roads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source_location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    target_location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    distance_km DOUBLE PRECISION NOT NULL,
    speed_limit_kmh DOUBLE PRECISION DEFAULT 50.0,
    capacity_vph INTEGER DEFAULT 3000,
    lanes INTEGER DEFAULT 4,
    is_closed BOOLEAN DEFAULT FALSE,
    closure_reason TEXT,
    current_congestion DOUBLE PRECISION DEFAULT 0.2,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRAFFIC READINGS TABLE
CREATE TABLE IF NOT EXISTS traffic_readings (
    id BIGSERIAL PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    vehicle_count INTEGER NOT NULL,
    average_speed_kmh DOUBLE PRECISION NOT NULL,
    congestion_level DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'NORMAL',
    simulated BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_traffic_readings_loc_time ON traffic_readings(location_id, timestamp DESC);

-- 4. TRAFFIC PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS traffic_predictions (
    id BIGSERIAL PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    forecast_horizon_hours INTEGER NOT NULL,
    predicted_congestion DOUBLE PRECISION NOT NULL,
    predicted_speed DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION DEFAULT 0.95,
    model_version TEXT DEFAULT 'v1.4-ensemble-rf',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FLOOD OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS flood_observations (
    id BIGSERIAL PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    rainfall_mm DOUBLE PRECISION NOT NULL,
    water_level_m DOUBLE PRECISION NOT NULL,
    drainage_capacity_pct DOUBLE PRECISION NOT NULL,
    risk_level TEXT DEFAULT 'LOW',
    simulated BOOLEAN DEFAULT TRUE
);

-- 6. FLOOD PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS flood_predictions (
    id BIGSERIAL PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    predicted_risk_level TEXT NOT NULL,
    risk_probability DOUBLE PRECISION NOT NULL,
    drainage_blockage_factor DOUBLE PRECISION DEFAULT 0.2,
    rainfall_intensity DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION DEFAULT 0.91,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INFRASTRUCTURE SENSORS TABLE
CREATE TABLE IF NOT EXISTS infrastructure_sensors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    location_id TEXT REFERENCES locations(id) ON DELETE CASCADE,
    unit TEXT NOT NULL,
    min_threshold DOUBLE PRECISION,
    max_threshold DOUBLE PRECISION,
    current_value DOUBLE PRECISION DEFAULT 0.0,
    status TEXT DEFAULT 'NORMAL',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SENSOR READINGS TABLE
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id TEXT REFERENCES infrastructure_sensors(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    value DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'NORMAL',
    simulated BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sens_time ON sensor_readings(sensor_id, timestamp DESC);

-- 9. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL,
    severity TEXT DEFAULT 'WARNING',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_alerts_ack_time ON alerts(is_acknowledged, timestamp DESC);

-- 10. SIMULATION SCENARIOS TABLE
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rainfall_intensity DOUBLE PRECISION DEFAULT 0.0,
    drainage_capacity DOUBLE PRECISION DEFAULT 80.0,
    traffic_volume_multiplier DOUBLE PRECISION DEFAULT 1.0,
    water_demand_multiplier DOUBLE PRECISION DEFAULT 1.0,
    electricity_demand_multiplier DOUBLE PRECISION DEFAULT 1.0,
    closed_roads JSONB DEFAULT '[]'::jsonb,
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EMERGENCY ROUTES TABLE
CREATE TABLE IF NOT EXISTS emergency_routes (
    id TEXT PRIMARY KEY,
    service_type TEXT DEFAULT 'AMBULANCE',
    source_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    path_nodes JSONB NOT NULL,
    total_distance_km DOUBLE PRECISION NOT NULL,
    estimated_time_mins DOUBLE PRECISION NOT NULL,
    avoided_roads JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- SEED INITIAL BENGALURU DEMONSTRATION DATA (UPSERT)
-- ========================================================

INSERT INTO locations (id, name, category, latitude, longitude, elevation, ward_number, population_density)
VALUES 
    ('hebbal', 'Hebbal Flyover & Lake', 'transit_hub', 13.0358, 77.5970, 888.0, 7, 18500),
    ('yelahanka', 'Yelahanka Suburb', 'residential', 13.1007, 77.5963, 915.0, 1, 11200),
    ('majestic', 'Majestic Central Station (KBS)', 'transit_hub', 12.9767, 77.5713, 918.0, 94, 29000),
    ('indiranagar', 'Indiranagar 100ft Rd', 'commercial', 12.9784, 77.6408, 905.0, 112, 16400),
    ('koramangala', 'Koramangala 80ft Rd', 'commercial', 12.9352, 77.6245, 882.0, 151, 21000),
    ('whitefield', 'Whitefield ITPL Corridor', 'tech_corridor', 12.9698, 77.7500, 922.0, 84, 14500),
    ('kr_market', 'KR Market (City Market)', 'trade_center', 12.9634, 77.5770, 901.0, 119, 34000),
    ('mg_road', 'MG Road Central CBD', 'commercial', 12.9756, 77.6066, 920.0, 111, 19800),
    ('silk_board', 'Silk Board Junction', 'transit_hub', 12.9177, 77.6238, 890.0, 174, 24000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO roads (id, name, source_location_id, target_location_id, distance_km, speed_limit_kmh, capacity_vph, lanes, is_closed, current_congestion)
VALUES
    ('road-hebbal-yelahanka', 'Bellary Road Expressway (NH 44)', 'hebbal', 'yelahanka', 7.4, 65.0, 4500, 6, FALSE, 0.42),
    ('road-hebbal-majestic', 'Outer Ring Rd to Seshadri Rd', 'hebbal', 'majestic', 8.1, 45.0, 3800, 4, FALSE, 0.68),
    ('road-majestic-kr_market', 'Tank Bund & Avenue Road', 'majestic', 'kr_market', 2.2, 35.0, 2800, 4, FALSE, 0.82),
    ('road-majestic-mg_road', 'Kasturba Road / Cubbon Park Corridor', 'majestic', 'mg_road', 4.1, 45.0, 3200, 4, FALSE, 0.54),
    ('road-mg_road-indiranagar', 'Old Madras Road & CMH Road', 'mg_road', 'indiranagar', 3.9, 45.0, 3100, 4, FALSE, 0.61),
    ('road-indiranagar-whitefield', 'HAL Old Airport Road Corridor', 'indiranagar', 'whitefield', 12.8, 50.0, 3600, 4, FALSE, 0.74),
    ('road-kr_market-koramangala', 'Hosur Main Road Link', 'kr_market', 'koramangala', 6.3, 45.0, 3400, 4, FALSE, 0.59),
    ('road-koramangala-silk_board', 'Sarjapur Road / Madiwala Underpass', 'koramangala', 'silk_board', 3.2, 40.0, 4200, 6, FALSE, 0.88),
    ('road-silk_board-whitefield', 'Outer Ring Road (ORR) Tech Spine', 'silk_board', 'whitefield', 15.6, 60.0, 5000, 6, FALSE, 0.79),
    ('road-mg_road-koramangala', 'Intermediate Ring Road (IRR)', 'mg_road', 'koramangala', 5.1, 50.0, 3300, 4, FALSE, 0.49)
ON CONFLICT (id) DO NOTHING;

INSERT INTO infrastructure_sensors (id, name, sensor_type, location_id, unit, min_threshold, max_threshold, current_value, status)
VALUES
    ('sens-hebbal-rain', 'Hebbal Sump Stormwater Inflow Sensor', 'WATER_LEVEL', 'hebbal', 'm', 0.5, 3.8, 2.1, 'NORMAL'),
    ('sens-hebbal-power', 'Hebbal 220kV Grid Substation Main Transformer', 'POWER_LOAD', 'hebbal', '%', 20.0, 85.0, 68.4, 'NORMAL'),
    ('sens-koramangala-flow', 'Koramangala Valley Storm Drain Acoustic Flowmeter', 'WATER_FLOW', 'koramangala', 'L/min', 100.0, 4800.0, 3100.0, 'WARNING'),
    ('sens-koramangala-power', 'Koramangala Tech Park Distribution Bus', 'POWER_VOLTAGE', 'koramangala', 'V', 215.0, 242.0, 231.5, 'NORMAL'),
    ('sens-majestic-pipe', 'Majestic Central Water Feeder Main Pressure', 'WATER_PRESSURE', 'majestic', 'bar', 2.2, 5.5, 3.8, 'NORMAL'),
    ('sens-whitefield-temp', 'Whitefield Export Substation Oil Thermal Sensor', 'TRANSFORMER_TEMP', 'whitefield', '°C', 30.0, 82.0, 64.2, 'NORMAL'),
    ('sens-silkboard-drain', 'Silk Board Underpass Sump Level', 'WATER_LEVEL', 'silk_board', 'm', 0.2, 2.5, 1.9, 'WARNING'),
    ('sens-krmarket-pressure', 'KR Market Old Supply Line Hydraulic Pressure', 'WATER_PRESSURE', 'kr_market', 'bar', 2.0, 5.0, 1.7, 'WARNING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (id, location_id, alert_type, severity, title, description, is_acknowledged)
VALUES
    ('alt-001', 'silk_board', 'TRAFFIC_GRIDLOCK', 'CRITICAL', 'Severe Bottleneck Surge at Silk Board', 'Peak hour volume exceeds rated link capacity by 142%. Average vehicle crawl speed dropped to 6 km/h. Automated diversion recommended.', FALSE),
    ('alt-002', 'koramangala', 'FLOOD_SURGE', 'WARNING', 'Storm Drain Inflow Warning in 80ft Road', 'Acoustic flowmeter indicates 78% capacity saturation. Sump drainage pumps have been primed for automated cycle.', FALSE),
    ('alt-003', 'kr_market', 'WATER_LEAK', 'WARNING', 'Subsurface Pipeline Pressure Anomaly', 'Feed line pressure decreased from 3.2 bar to 1.7 bar. Potential fissure detected in KR Market sector 4 piping.', FALSE)
ON CONFLICT (id) DO NOTHING;
