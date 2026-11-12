/**
 * Centralized API service for NEURAL CITY Digital Twin
 * Connects frontend modules to backend REST endpoints.
 */

// Compute safe API base URL
const getApiBase = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!envUrl) return '';
  // Supabase is the PostgreSQL database, not the REST API server! Never send /api/* to supabase.co
  if (envUrl.includes('supabase.co') || envUrl.includes('supabase.in') || envUrl.includes('postgres')) {
    return '';
  }
  if (typeof window !== 'undefined' && (envUrl === window.location.origin || envUrl.startsWith(window.location.origin))) {
    return '';
  }
  return envUrl.replace(/\/+$/, '');
};

const API_BASE = getApiBase();

export interface DashboardOverview {
  monitored_locations_count: number;
  average_traffic_congestion_pct: number;
  traffic_status: string;
  high_flood_risk_zones_count: number;
  flood_status: string;
  water_infrastructure_health_pct: number;
  electricity_infrastructure_health_pct: number;
  active_critical_alerts_count: number;
  active_warning_alerts_count: number;
  city_health_score: number;
  system_mode: string;
  telemetry_timestamp: string;
  quick_trends: {
    traffic_change_1h: string;
    water_consumption_rate: string;
    power_draw_current: string;
    storm_drain_capacity_avg: string;
  };
}

export interface CityLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  elevation: number;
  ward_number: number;
  population_density: number;
  current_congestion: number;
  current_flood_risk: string;
  sensor_count: number;
  active_alerts_count: number;
}

export interface CityRoad {
  id: string;
  name: string;
  source_location_id: string;
  target_location_id: string;
  distance_km: number;
  speed_limit_kmh: number;
  capacity_vph: number;
  lanes: number;
  is_closed: boolean;
  current_congestion: number;
  closure_reason?: string | null;
}

export interface TrafficStatusItem {
  location_id: string;
  location_name: string;
  congestion_level: number;
  vehicle_count: number;
  average_speed_kmh: number;
  status: string;
  timestamp: string;
}

export interface TrafficPredictionResponse {
  location_id: string;
  location_name: string;
  horizon_hours: number;
  current_congestion: number;
  predicted_congestion: number;
  predicted_speed_kmh: number;
  trend: string;
  confidence_score: number;
  model_metrics: {
    r2_score: number;
    rmse: number;
    mae: number;
    samples: number;
  };
  historical_comparison: Array<{
    horizon_hours: number;
    predicted_congestion: number;
    speed_kmh: number;
  }>;
}

export interface FloodLocationItem {
  location_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  risk_level: string;
  risk_probability: number;
  water_accumulation_depth_cm: number;
  drainage_capacity_pct: number;
}

export interface FloodPredictionResponse {
  location_id: string;
  location_name: string;
  elevation_m: number;
  rainfall_mm: number;
  drainage_capacity_pct: number;
  predicted_risk_level: string;
  risk_probability: number;
  water_accumulation_depth_cm: number;
  contributing_factors: Array<{
    factor: string;
    weight: string;
    status: string;
    value: string;
  }>;
  confidence_score: number;
}

export interface InfrastructureSensor {
  id: string;
  name: string;
  sensor_type: string;
  location_id: string;
  location_name: string;
  unit: string;
  min_threshold?: number;
  max_threshold?: number;
  current_value: number;
  status: string;
  is_active: boolean;
}

export interface AlertItem {
  id: string;
  location_id: string;
  location_name: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: string;
  is_acknowledged: boolean;
  acknowledged_by?: string | null;
}

export interface EmergencyRouteResponse {
  service_type: string;
  source_id: string;
  destination_id: string;
  path_nodes: CityLocation[];
  route_polyline: number[][];
  total_distance_km: number;
  estimated_time_mins: number;
  congestion_delay_mins: number;
  avoided_hazards: string[];
  road_segments: CityRoad[];
}

export interface SimulationResult {
  scenario_id: string;
  timestamp: string;
  inputs: {
    scenario_name: string;
    rainfall_intensity_mm: number;
    drainage_capacity_pct: number;
    traffic_surge_factor: number;
    water_demand_factor: number;
    electricity_demand_factor: number;
    simulated_road_closures: string[];
  };
  baseline_health_score: number;
  simulated_health_score: number;
  health_score_delta: number;
  affected_locations_count: number;
  at_risk_population: number;
  cascade_chain: string[];
  flood_impacts: Array<{
    location_id: string;
    location_name: string;
    elevation_m: number;
    risk_level: string;
    risk_probability: number;
    water_depth_cm: number;
  }>;
  traffic_impacts: Array<{
    road_id: string;
    road_name: string;
    original_congestion: number;
    simulated_congestion: number;
    status: string;
  }>;
  power_water_impacts: Array<{
    subsystem: string;
    parameter: string;
    simulated_value: string;
    status: string;
    risk_description: string;
  }>;
  rerouted_emergency_paths: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${text.slice(0, 200) || response.statusText}`);
  }

  // Guard against HTML documents (e.g. auth redirects, iframe challenges, or SPA fallbacks)
  const trimmed = text.trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!doctype') || (!contentType.includes('application/json') && trimmed.includes('<html'))) {
    throw new Error(`API ${endpoint} returned HTML document instead of JSON (status: ${response.status}). Expected application/json.`);
  }

  try {
    return JSON.parse(text) as T;
  } catch (err: any) {
    throw new Error(`Invalid JSON received from ${endpoint}: ${text.slice(0, 100)}`);
  }
}

export const api = {
  getOverview: () => request<DashboardOverview>('/api/dashboard/overview'),
  getLocations: () => request<CityLocation[]>('/api/locations'),
  getRoads: () => request<CityRoad[]>('/api/roads'),
  getCurrentTraffic: () => request<TrafficStatusItem[]>('/api/traffic/current'),
  getTrafficHistory: (locationId: string) => request<{ location_id: string; location_name: string; readings: any[] }>(`/api/traffic/history/${locationId}`),
  predictTraffic: (locationId: string, horizonHours = 1, rainMm = 0, isPeak = false) =>
    request<TrafficPredictionResponse>('/api/traffic/predict', {
      method: 'POST',
      body: JSON.stringify({
        location_id: locationId,
        horizon_hours: horizonHours,
        simulated_weather_rain_mm: rainMm,
        is_peak_hour: isPeak,
      }),
    }),
  getFloodLocations: () => request<FloodLocationItem[]>('/api/flood/locations'),
  predictFlood: (locationId: string, rainfallMmH: number, drainagePct: number, antecedentDays = 2) =>
    request<FloodPredictionResponse>('/api/flood/predict', {
      method: 'POST',
      body: JSON.stringify({
        location_id: locationId,
        rainfall_mm_per_hour: rainfallMmH,
        drainage_capacity_pct: drainagePct,
        antecedent_precipitation_days: antecedentDays,
      }),
    }),
  getSensors: () => request<InfrastructureSensor[]>('/api/infrastructure/sensors'),
  getSensorReadings: (sensorId: string) => request<{ sensor: InfrastructureSensor; readings: any[] }>(`/api/infrastructure/readings/${sensorId}`),
  getAlerts: () => request<AlertItem[]>('/api/alerts'),
  acknowledgeAlert: (alertId: string, acknowledgedBy = 'Central Operator') =>
    request<{ status: string; message: string }>('/api/alerts/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, acknowledged_by: acknowledgedBy }),
    }),
  calculateEmergencyRoute: (params: {
    source_id: string;
    destination_id: string;
    service_type?: string;
    avoid_closed_roads?: boolean;
    consider_traffic_congestion?: boolean;
    consider_flood_risk?: boolean;
  }) =>
    request<EmergencyRouteResponse>('/api/emergency/route', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  toggleRoadClosure: (roadId: string, isClosed: boolean, reason?: string) =>
    request<{ status: string; road_id: string; is_closed: boolean; reason?: string }>('/api/emergency/road-closure', {
      method: 'POST',
      body: JSON.stringify({ road_id: roadId, is_closed: isClosed, closure_reason: reason }),
    }),
  runSimulation: (params: {
    scenario_name?: string;
    rainfall_intensity_mm?: number;
    drainage_capacity_pct?: number;
    traffic_surge_factor?: number;
    water_demand_factor?: number;
    electricity_demand_factor?: number;
    simulated_road_closures?: string[];
  }) =>
    request<SimulationResult>('/api/simulation/run', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getSimulationHistory: () => request<SimulationResult[]>('/api/simulation/history'),
  getHealth: () => request<any>('/api/health'),
  getDatabaseStatus: () => request<{
    configured: boolean;
    connected: boolean;
    endpoint: string;
    tables_ready: string[];
    error: string | null;
    mode: string;
    schema_file: string;
  }>('/api/database/status'),
  syncDatabase: () => request<{ status: string; message: string; supabase?: any }>('/api/database/sync', {
    method: 'POST',
  }),
  configureDatabase: (key: string, url?: string) =>
    request<{ success: boolean; test: any; message: string }>('/api/database/configure', {
      method: 'POST',
      body: JSON.stringify({ key, url }),
    }),
  verifyDatabase: (key?: string, url?: string) =>
    request<{
      connected: boolean;
      url: string;
      verified_tables_count: number;
      total_tables_count: number;
      tables: Array<{
        name: string;
        exists: boolean;
        row_count: number;
        sample?: any;
        error?: string | null;
      }>;
      read_write_test: {
        success: boolean;
        table: string;
        write_record_id?: any;
        read_record_verified?: boolean;
        cleanup_status?: string;
        error?: string | null;
      };
      error?: string | null;
    }>(key ? '/api/database/verify' : '/api/database/verify', key ? {
      method: 'POST',
      body: JSON.stringify({ key, url }),
    } : {
      method: 'GET',
    }),
};

export const FALLBACK_LOCATIONS: CityLocation[] = [
  { id: "hebbal", name: "Hebbal Flyover & Lake", category: "transit_hub", latitude: 13.0358, longitude: 77.5970, elevation: 888.0, ward_number: 7, population_density: 18500, current_congestion: 0.55, current_flood_risk: "MODERATE", sensor_count: 2, active_alerts_count: 0 },
  { id: "yelahanka", name: "Yelahanka Suburb", category: "residential", latitude: 13.1007, longitude: 77.5963, elevation: 915.0, ward_number: 1, population_density: 11200, current_congestion: 0.42, current_flood_risk: "LOW", sensor_count: 0, active_alerts_count: 0 },
  { id: "majestic", name: "Majestic Central Station (KBS)", category: "transit_hub", latitude: 12.9767, longitude: 77.5713, elevation: 918.0, ward_number: 94, population_density: 29000, current_congestion: 0.68, current_flood_risk: "LOW", sensor_count: 1, active_alerts_count: 0 },
  { id: "indiranagar", name: "Indiranagar 100ft Rd", category: "commercial", latitude: 12.9784, longitude: 77.6408, elevation: 905.0, ward_number: 112, population_density: 16400, current_congestion: 0.67, current_flood_risk: "LOW", sensor_count: 0, active_alerts_count: 0 },
  { id: "koramangala", name: "Koramangala 80ft Rd", category: "commercial", latitude: 12.9352, longitude: 77.6245, elevation: 882.0, ward_number: 151, population_density: 21000, current_congestion: 0.65, current_flood_risk: "HIGH", sensor_count: 2, active_alerts_count: 1 },
  { id: "whitefield", name: "Whitefield ITPL Corridor", category: "tech_corridor", latitude: 12.9698, longitude: 77.7500, elevation: 922.0, ward_number: 84, population_density: 14500, current_congestion: 0.76, current_flood_risk: "LOW", sensor_count: 1, active_alerts_count: 0 },
  { id: "kr_market", name: "KR Market (City Market)", category: "trade_center", latitude: 12.9634, longitude: 77.5770, elevation: 901.0, ward_number: 119, population_density: 34000, current_congestion: 0.70, current_flood_risk: "MODERATE", sensor_count: 1, active_alerts_count: 1 },
  { id: "mg_road", name: "MG Road Central CBD", category: "commercial", latitude: 12.9756, longitude: 77.6066, elevation: 920.0, ward_number: 111, population_density: 19800, current_congestion: 0.55, current_flood_risk: "LOW", sensor_count: 0, active_alerts_count: 0 },
  { id: "silk_board", name: "Silk Board Junction", category: "transit_hub", latitude: 12.9177, longitude: 77.6238, elevation: 890.0, ward_number: 174, population_density: 24000, current_congestion: 0.83, current_flood_risk: "HIGH", sensor_count: 1, active_alerts_count: 1 }
];

export const FALLBACK_ROADS: CityRoad[] = [
  { id: "road-hebbal-yelahanka", name: "Bellary Road Expressway (NH 44)", source_location_id: "hebbal", target_location_id: "yelahanka", distance_km: 7.4, speed_limit_kmh: 65.0, capacity_vph: 4500, lanes: 6, is_closed: false, current_congestion: 0.42 },
  { id: "road-hebbal-majestic", name: "Outer Ring Rd to Seshadri Rd", source_location_id: "hebbal", target_location_id: "majestic", distance_km: 8.1, speed_limit_kmh: 45.0, capacity_vph: 3800, lanes: 4, is_closed: false, current_congestion: 0.68 },
  { id: "road-majestic-kr_market", name: "Tank Bund & Avenue Road", source_location_id: "majestic", target_location_id: "kr_market", distance_km: 2.2, speed_limit_kmh: 35.0, capacity_vph: 2800, lanes: 4, is_closed: false, current_congestion: 0.82 },
  { id: "road-majestic-mg_road", name: "Kasturba Road / Cubbon Park Corridor", source_location_id: "majestic", target_location_id: "mg_road", distance_km: 4.1, speed_limit_kmh: 45.0, capacity_vph: 3200, lanes: 4, is_closed: false, current_congestion: 0.54 },
  { id: "road-mg_road-indiranagar", name: "Old Madras Road & CMH Road", source_location_id: "mg_road", target_location_id: "indiranagar", distance_km: 3.9, speed_limit_kmh: 45.0, capacity_vph: 3100, lanes: 4, is_closed: false, current_congestion: 0.61 },
  { id: "road-indiranagar-whitefield", name: "HAL Old Airport Road Corridor", source_location_id: "indiranagar", target_location_id: "whitefield", distance_km: 12.8, speed_limit_kmh: 50.0, capacity_vph: 3600, lanes: 4, is_closed: false, current_congestion: 0.74 },
  { id: "road-kr_market-koramangala", name: "Hosur Main Road Link", source_location_id: "kr_market", target_location_id: "koramangala", distance_km: 6.3, speed_limit_kmh: 45.0, capacity_vph: 3400, lanes: 4, is_closed: false, current_congestion: 0.59 },
  { id: "road-koramangala-silk_board", name: "Sarjapur Road / Madiwala Underpass", source_location_id: "koramangala", target_location_id: "silk_board", distance_km: 3.2, speed_limit_kmh: 40.0, capacity_vph: 4200, lanes: 6, is_closed: false, current_congestion: 0.88 },
  { id: "road-silk_board-whitefield", name: "Outer Ring Road (ORR) Tech Spine", source_location_id: "silk_board", target_location_id: "whitefield", distance_km: 15.6, speed_limit_kmh: 60.0, capacity_vph: 5000, lanes: 6, is_closed: false, current_congestion: 0.79 },
  { id: "road-mg_road-koramangala", name: "Intermediate Ring Road (IRR)", source_location_id: "mg_road", target_location_id: "koramangala", distance_km: 5.1, speed_limit_kmh: 50.0, capacity_vph: 3300, lanes: 4, is_closed: false, current_congestion: 0.49 }
];

export const FALLBACK_SENSORS: InfrastructureSensor[] = [
  { id: "sens-hebbal-rain", name: "Hebbal Sump Stormwater Inflow Sensor", sensor_type: "WATER_LEVEL", location_id: "hebbal", location_name: "Hebbal Flyover & Lake", unit: "m", min_threshold: 0.5, max_threshold: 3.8, current_value: 2.1, status: "NORMAL", is_active: true },
  { id: "sens-hebbal-power", name: "Hebbal 220kV Grid Substation Main Transformer", sensor_type: "POWER_LOAD", location_id: "hebbal", location_name: "Hebbal Flyover & Lake", unit: "%", min_threshold: 20.0, max_threshold: 85.0, current_value: 68.4, status: "NORMAL", is_active: true },
  { id: "sens-koramangala-flow", name: "Koramangala Valley Storm Drain Acoustic Flowmeter", sensor_type: "WATER_FLOW", location_id: "koramangala", location_name: "Koramangala 80ft Rd", unit: "L/min", min_threshold: 100.0, max_threshold: 4800.0, current_value: 3100.0, status: "WARNING", is_active: true },
  { id: "sens-koramangala-power", name: "Koramangala Tech Park Distribution Bus", sensor_type: "POWER_VOLTAGE", location_id: "koramangala", location_name: "Koramangala 80ft Rd", unit: "V", min_threshold: 215.0, max_threshold: 242.0, current_value: 231.5, status: "NORMAL", is_active: true },
  { id: "sens-majestic-pipe", name: "Majestic Central Water Feeder Main Pressure", sensor_type: "WATER_PRESSURE", location_id: "majestic", location_name: "Majestic Central Station (KBS)", unit: "bar", min_threshold: 2.2, max_threshold: 5.5, current_value: 3.8, status: "NORMAL", is_active: true },
  { id: "sens-whitefield-temp", name: "Whitefield Export Substation Oil Thermal Sensor", sensor_type: "TRANSFORMER_TEMP", location_id: "whitefield", location_name: "Whitefield ITPL Corridor", unit: "°C", min_threshold: 30.0, max_threshold: 82.0, current_value: 64.2, status: "NORMAL", is_active: true },
  { id: "sens-silkboard-drain", name: "Silk Board Underpass Sump Level", sensor_type: "WATER_LEVEL", location_id: "silk_board", location_name: "Silk Board Junction", unit: "m", min_threshold: 0.2, max_threshold: 2.5, current_value: 1.9, status: "WARNING", is_active: true },
  { id: "sens-krmarket-pressure", name: "KR Market Old Supply Line Hydraulic Pressure", sensor_type: "WATER_PRESSURE", location_id: "kr_market", location_name: "KR Market (City Market)", unit: "bar", min_threshold: 2.0, max_threshold: 5.0, current_value: 1.7, status: "WARNING", is_active: true }
];

export const FALLBACK_ALERTS: AlertItem[] = [
  { id: "alt-001", location_id: "silk_board", location_name: "Silk Board Junction", alert_type: "TRAFFIC_GRIDLOCK", severity: "CRITICAL", title: "Severe Bottleneck Surge at Silk Board", description: "Peak hour volume exceeds rated link capacity by 142%. Average crawl speed dropped to 6 km/h. Automated diversion recommended.", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), is_acknowledged: false, acknowledged_by: null },
  { id: "alt-002", location_id: "koramangala", location_name: "Koramangala 80ft Rd", alert_type: "FLOOD_SURGE", severity: "WARNING", title: "Storm Drain Inflow Warning in 80ft Road", description: "Acoustic flowmeter indicates 78% capacity saturation. Sump drainage pumps have been primed for automated cycle.", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), is_acknowledged: false, acknowledged_by: null },
  { id: "alt-003", location_id: "kr_market", location_name: "KR Market (City Market)", alert_type: "WATER_LEAK", severity: "WARNING", title: "Subsurface Pipeline Pressure Anomaly", description: "Feed line pressure decreased from 3.2 bar to 1.7 bar. Potential fissure detected in KR Market sector 4 piping.", timestamp: new Date(Date.now() - 8 * 60000).toISOString(), is_acknowledged: false, acknowledged_by: null }
];

export const FALLBACK_OVERVIEW: DashboardOverview = {
  monitored_locations_count: 9,
  average_traffic_congestion_pct: 65.6,
  traffic_status: "ELEVATED",
  high_flood_risk_zones_count: 2,
  flood_status: "MODERATE_WATCH",
  water_infrastructure_health_pct: 91.5,
  electricity_infrastructure_health_pct: 94.2,
  active_critical_alerts_count: 1,
  active_warning_alerts_count: 2,
  city_health_score: 88.5,
  system_mode: "LIVE_SIMULATED_TWIN",
  telemetry_timestamp: new Date().toISOString(),
  quick_trends: {
    traffic_change_1h: "+4.2%",
    water_consumption_rate: "1,420 MLD",
    power_draw_current: "3,180 MW",
    storm_drain_capacity_avg: "78%"
  }
};
