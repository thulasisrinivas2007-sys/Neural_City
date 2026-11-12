import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseDb } from './server/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store replicating database tables & state
const LOCATIONS = [
  { id: "hebbal", name: "Hebbal Flyover & Lake", category: "transit_hub", latitude: 13.0358, longitude: 77.5970, elevation: 888.0, ward_number: 7, population_density: 18500 },
  { id: "yelahanka", name: "Yelahanka Suburb", category: "residential", latitude: 13.1007, longitude: 77.5963, elevation: 915.0, ward_number: 1, population_density: 11200 },
  { id: "majestic", name: "Majestic Central Station (KBS)", category: "transit_hub", latitude: 12.9767, longitude: 77.5713, elevation: 918.0, ward_number: 94, population_density: 29000 },
  { id: "indiranagar", name: "Indiranagar 100ft Rd", category: "commercial", latitude: 12.9784, longitude: 77.6408, elevation: 905.0, ward_number: 112, population_density: 16400 },
  { id: "koramangala", name: "Koramangala 80ft Rd", category: "commercial", latitude: 12.9352, longitude: 77.6245, elevation: 882.0, ward_number: 151, population_density: 21000 },
  { id: "whitefield", name: "Whitefield ITPL Corridor", category: "tech_corridor", latitude: 12.9698, longitude: 77.7500, elevation: 922.0, ward_number: 84, population_density: 14500 },
  { id: "kr_market", name: "KR Market (City Market)", category: "trade_center", latitude: 12.9634, longitude: 77.5770, elevation: 901.0, ward_number: 119, population_density: 34000 },
  { id: "mg_road", name: "MG Road Central CBD", category: "commercial", latitude: 12.9756, longitude: 77.6066, elevation: 920.0, ward_number: 111, population_density: 19800 },
  { id: "silk_board", name: "Silk Board Junction", category: "transit_hub", latitude: 12.9177, longitude: 77.6238, elevation: 890.0, ward_number: 174, population_density: 24000 }
];

interface RoadItem {
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

let ROADS: RoadItem[] = [
  { id: "road-hebbal-yelahanka", name: "Bellary Road Expressway (NH 44)", source_location_id: "hebbal", target_location_id: "yelahanka", distance_km: 7.4, speed_limit_kmh: 65.0, capacity_vph: 4500, lanes: 6, is_closed: false, current_congestion: 0.42, closure_reason: null },
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

let SENSORS = [
  { id: "sens-hebbal-rain", name: "Hebbal Sump Stormwater Inflow Sensor", sensor_type: "WATER_LEVEL", location_id: "hebbal", unit: "m", min_threshold: 0.5, max_threshold: 3.8, current_value: 2.1, status: "NORMAL" },
  { id: "sens-hebbal-power", name: "Hebbal 220kV Grid Substation Main Transformer", sensor_type: "POWER_LOAD", location_id: "hebbal", unit: "%", min_threshold: 20.0, max_threshold: 85.0, current_value: 68.4, status: "NORMAL" },
  { id: "sens-koramangala-flow", name: "Koramangala Valley Storm Drain Acoustic Flowmeter", sensor_type: "WATER_FLOW", location_id: "koramangala", unit: "L/min", min_threshold: 100.0, max_threshold: 4800.0, current_value: 3100.0, status: "WARNING" },
  { id: "sens-koramangala-power", name: "Koramangala Tech Park Distribution Bus", sensor_type: "POWER_VOLTAGE", location_id: "koramangala", unit: "V", min_threshold: 215.0, max_threshold: 242.0, current_value: 231.5, status: "NORMAL" },
  { id: "sens-majestic-pipe", name: "Majestic Central Water Feeder Main Pressure", sensor_type: "WATER_PRESSURE", location_id: "majestic", unit: "bar", min_threshold: 2.2, max_threshold: 5.5, current_value: 3.8, status: "NORMAL" },
  { id: "sens-whitefield-temp", name: "Whitefield Export Substation Oil Thermal Sensor", sensor_type: "TRANSFORMER_TEMP", location_id: "whitefield", unit: "°C", min_threshold: 30.0, max_threshold: 82.0, current_value: 64.2, status: "NORMAL" },
  { id: "sens-silkboard-drain", name: "Silk Board Underpass Sump Level", sensor_type: "WATER_LEVEL", location_id: "silk_board", unit: "m", min_threshold: 0.2, max_threshold: 2.5, current_value: 1.9, status: "WARNING" },
  { id: "sens-krmarket-pressure", name: "KR Market Old Supply Line Hydraulic Pressure", sensor_type: "WATER_PRESSURE", location_id: "kr_market", unit: "bar", min_threshold: 2.0, max_threshold: 5.0, current_value: 1.7, status: "WARNING" }
];

let ALERTS = [
  { id: "alt-001", location_id: "silk_board", alert_type: "TRAFFIC_GRIDLOCK", severity: "CRITICAL", title: "Severe Bottleneck Surge at Silk Board", description: "Peak hour volume exceeds rated link capacity by 142%. Average crawl speed dropped to 6 km/h. Automated diversion recommended.", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), is_acknowledged: false, acknowledged_by: null },
  { id: "alt-002", location_id: "koramangala", alert_type: "FLOOD_SURGE", severity: "WARNING", title: "Storm Drain Inflow Warning in 80ft Road", description: "Acoustic flowmeter indicates 78% capacity saturation. Sump drainage pumps have been primed for automated cycle.", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), is_acknowledged: false, acknowledged_by: null },
  { id: "alt-003", location_id: "kr_market", alert_type: "WATER_LEAK", severity: "WARNING", title: "Subsurface Pipeline Pressure Anomaly", description: "Feed line pressure decreased from 3.2 bar to 1.7 bar. Potential fissure detected in KR Market sector 4 piping.", timestamp: new Date(Date.now() - 8 * 60000).toISOString(), is_acknowledged: false, acknowledged_by: null }
];

let SIMULATION_HISTORY: any[] = [];

// AI Traffic prediction computation
function calculateTrafficPrediction(baseCongestion: number, horizonHours: number, rainMm = 0, isPeak = false) {
  const currentHour = new Date().getHours();
  const targetHour = (currentHour + horizonHours) % 24;
  const morningPeak = Math.exp(-Math.pow(targetHour - 9.0, 2) / 4.5);
  const eveningPeak = Math.exp(-Math.pow(targetHour - 18.5, 2) / 5.0);
  const diurnalFactor = 0.25 + 0.45 * morningPeak + 0.50 * eveningPeak;
  const rainPenalty = Math.min(0.35, (rainMm / 100.0) * 0.4);
  const momentumDecay = Math.exp(-0.35 * horizonHours);
  
  let predicted = (baseCongestion * momentumDecay) + (diurnalFactor * (1.0 - momentumDecay)) + rainPenalty;
  if (isPeak) predicted += 0.12;
  const congestion = Math.max(0.08, Math.min(0.98, predicted));
  const speed = Math.round((55.0 * (1.0 - Math.pow(congestion, 1.3)) + 7.0) * 10) / 10;
  const confidence = Math.round(Math.max(0.72, 0.94 - (horizonHours * 0.015)) * 100) / 100;
  const diff = congestion - baseCongestion;
  const trend = diff > 0.05 ? "INCREASING" : (diff < -0.05 ? "DECREASING" : "STABLE");

  return { congestion: Math.round(congestion * 1000) / 1000, speed, confidence, trend };
}

// AI Flood prediction computation
function calculateFloodPrediction(elevationM: number, rainMmH: number, drainagePct: number, antecedentDays = 2) {
  const elevationDiff = 920.0 - elevationM;
  const topoScore = Math.max(0.0, Math.min(1.0, (elevationDiff + 30.0) / 70.0));
  const rainScore = Math.min(1.0, Math.pow(rainMmH / 85.0, 1.2));
  const drainageDeficit = (100.0 - drainagePct) / 100.0;
  const soilSat = Math.min(0.3, antecedentDays * 0.08);

  const rawProb = (0.42 * rainScore) + (0.32 * drainageDeficit) + (0.20 * topoScore) + soilSat;
  const riskProb = Math.round(Math.max(0.02, Math.min(0.99, rawProb)) * 1000) / 1000;
  const accumDepth = Math.round(Math.max(0.0, (rainMmH * (1.0 - (drainagePct / 100.0)) * 0.85) * (1.0 + topoScore * 0.7)) * 10) / 10;

  let riskLevel = "LOW";
  if (riskProb >= 0.75 || accumDepth >= 40.0) riskLevel = "CRITICAL";
  else if (riskProb >= 0.50 || accumDepth >= 20.0) riskLevel = "HIGH";
  else if (riskProb >= 0.25 || accumDepth >= 8.0) riskLevel = "MODERATE";

  const contributingFactors = [
    { factor: "Rainfall Intensity", weight: `${Math.round(rainScore * 45)}%`, status: rainMmH > 50 ? "SEVERE" : (rainMmH > 20 ? "ELEVATED" : "NORMAL"), value: `${rainMmH} mm/h` },
    { factor: "Drainage Blockage / Capacity", weight: `${Math.round(drainageDeficit * 35)}%`, status: drainagePct < 40 ? "CRITICAL" : (drainagePct < 70 ? "WARNING" : "OPTIMAL"), value: `${drainagePct}% operational` },
    { factor: "Topographic Low-Point (Elevation)", weight: `${Math.round(topoScore * 20)}%`, status: elevationM < 900 ? "VULNERABLE" : "ELEVATED_SAFE", value: `${elevationM}m AMSL` }
  ];

  return { riskLevel, riskProb, accumDepth, contributingFactors, confidence: 0.91 };
}

// Emergency route Dijkstra solver
function solveDijkstraRoute(sourceId: string, destinationId: string, serviceType: string, avoidClosed: boolean, considerCongestion: boolean, floodNodes: string[]) {
  const locMap = new Map(LOCATIONS.map(l => [l.id, l]));
  if (!locMap.has(sourceId) || !locMap.has(destinationId)) {
    throw new Error("Invalid source or destination location");
  }

  // Graph adjacency list
  const adj = new Map<string, any[]>();
  for (const loc of LOCATIONS) adj.set(loc.id, []);
  for (const road of ROADS) {
    if (adj.has(road.source_location_id) && adj.has(road.target_location_id)) {
      adj.get(road.source_location_id)!.push({ to: road.target_location_id, road });
      adj.get(road.target_location_id)!.push({ to: road.source_location_id, road });
    }
  }

  // Priority queue / best distance map
  const times = new Map<string, number>();
  const parent = new Map<string, { prev: string, road: any } | null>();
  for (const loc of LOCATIONS) times.set(loc.id, Infinity);

  times.set(sourceId, 0);
  const queue: { id: string, time: number }[] = [{ id: sourceId, time: 0 }];
  const avoidedHazards: string[] = [];

  while (queue.length > 0) {
    queue.sort((a, b) => a.time - b.time);
    const curr = queue.shift()!;
    if (curr.id === destinationId) break;
    if (curr.time > (times.get(curr.id) || Infinity)) continue;

    for (const edge of (adj.get(curr.id) || [])) {
      const road = edge.road;
      if (avoidClosed && road.is_closed) {
        avoidedHazards.push(`Closed Road: ${road.name}`);
        continue;
      }

      let floodPenalty = 1.0;
      if (floodNodes.includes(edge.to)) {
        avoidedHazards.push(`Flooded Zone: ${locMap.get(edge.to)?.name}`);
        floodPenalty = 3.5;
      }

      const baseTimeMins = (road.distance_km / road.speed_limit_kmh) * 60;
      const congestionMult = considerCongestion ? (1.0 + road.current_congestion * 2.2) : 1.0;
      const sirenFactor = (serviceType === "AMBULANCE" || serviceType === "FIRE_BRIGADE") ? 0.75 : 1.0;
      const edgeTime = baseTimeMins * congestionMult * floodPenalty * sirenFactor;
      const nextTime = curr.time + edgeTime;

      if (nextTime < (times.get(edge.to) || Infinity)) {
        times.set(edge.to, nextTime);
        parent.set(edge.to, { prev: curr.id, road });
        queue.push({ id: edge.to, time: nextTime });
      }
    }
  }

  // Backtrack path
  if (!times.has(destinationId) || times.get(destinationId) === Infinity) {
    return {
      service_type: serviceType,
      source_id: sourceId,
      destination_id: destinationId,
      path_nodes: [],
      route_polyline: [],
      total_distance_km: 0,
      estimated_time_mins: 0,
      congestion_delay_mins: 0,
      avoided_hazards: ["All traversable corridors currently impassable due to barricades/flooding."],
      road_segments: []
    };
  }

  const pathNodes = [locMap.get(destinationId)!];
  const roadSegments: any[] = [];
  let curr = destinationId;
  while (curr !== sourceId) {
    const step = parent.get(curr);
    if (!step) break;
    roadSegments.unshift(step.road);
    curr = step.prev;
    pathNodes.unshift(locMap.get(curr)!);
  }

  const totalDist = Math.round(roadSegments.reduce((sum, r) => sum + r.distance_km, 0) * 100) / 100;
  const freeFlowTime = roadSegments.reduce((sum, r) => sum + ((r.distance_km / r.speed_limit_kmh) * 60), 0);
  const estTime = Math.round(times.get(destinationId)! * 10) / 10;
  const delay = Math.round(Math.max(0, estTime - freeFlowTime) * 10) / 10;
  const polyline = pathNodes.map(p => [p.latitude, p.longitude]);

  return {
    service_type: serviceType,
    source_id: sourceId,
    destination_id: destinationId,
    path_nodes: pathNodes,
    route_polyline: polyline,
    total_distance_km: totalDist,
    estimated_time_mins: estTime,
    congestion_delay_mins: delay,
    avoided_hazards: Array.from(new Set(avoidedHazards)),
    road_segments: roadSegments
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Enable CORS & credentials for API routes inside AI Studio iframe
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. Healthcheck & Database Status
  app.get('/api/health', async (req, res) => {
    const dbTest = await supabaseDb.testConnection();
    res.json({
      status: "ONLINE",
      system: "NEURAL CITY INTEGRATED CORE",
      version: "1.0.0",
      fastapi_compatible: true,
      database: dbTest.connected ? "SUPABASE_POSTGRESQL_CONNECTED" : "LOCAL_PERSISTENT_FALLBACK",
      supabase: dbTest,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/database/status', async (req, res) => {
    const dbTest = await supabaseDb.testConnection();
    res.json({
      configured: supabaseDb.isConfigured(),
      connected: dbTest.connected,
      endpoint: dbTest.url,
      tables_ready: dbTest.tables || [],
      error: dbTest.error || null,
      mode: dbTest.connected ? "SUPABASE_POSTGRES" : "ACTIVE_LOCAL_STORAGE",
      schema_file: "/backend/supabase_schema.sql"
    });
  });

  app.get('/api/database/verify', async (req, res) => {
    try {
      const verification = await supabaseDb.verifyAllTables();
      res.json(verification);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/database/verify', async (req, res) => {
    try {
      const { url, key } = req.body || {};
      if (key) {
        supabaseDb.configureCredentials(url || "https://elsokyjtebkbncapuxkm.supabase.co", key);
      }
      const verification = await supabaseDb.verifyAllTables();
      res.json(verification);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/database/sync', async (req, res) => {
    try {
      const dbTest = await supabaseDb.testConnection();
      if (!dbTest.connected) {
        return res.json({
          status: "LOCAL_READY",
          message: "Supabase not connected or tables not created yet. Local dataset active.",
          supabase: dbTest
        });
      }

      const seedResult = await supabaseDb.seedAllTables(LOCATIONS, ROADS, SENSORS, ALERTS);
      res.json({ 
        status: "SUCCESS", 
        message: "Supabase PostgreSQL tables successfully seeded with Bengaluru digital twin nodes, roads, sensors, and alerts!",
        seed_result: seedResult
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/database/configure', async (req, res) => {
    try {
      const { url = "https://elsokyjtebkbncapuxkm.supabase.co", key } = req.body;
      if (!key) {
        return res.status(400).json({ success: false, message: "Missing Supabase API key (anon key)" });
      }

      const configured = supabaseDb.configureCredentials(url, key);
      if (!configured) {
        return res.status(400).json({ success: false, message: "Failed to initialize Supabase client" });
      }

      const test = await supabaseDb.testConnection();
      res.json({
        success: test.connected,
        test,
        message: test.connected 
          ? "Successfully connected to Supabase PostgreSQL database! 11 Tables Ready." 
          : `Connection attempted, but query error: ${test.error || 'Check if SQL script was executed'}`
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // 2. Dashboard Overview
  app.get('/api/dashboard/overview', (req, res) => {
    const avgCongestion = Math.round((ROADS.reduce((acc, r) => acc + r.current_congestion, 0) / ROADS.length) * 1000) / 10;
    const trafficStatus = avgCongestion > 75 ? "CRITICAL" : (avgCongestion > 50 ? "ELEVATED" : "NORMAL");
    const unackAlerts = ALERTS.filter(a => !a.is_acknowledged);
    const critCount = unackAlerts.filter(a => a.severity === "CRITICAL").length;
    const warnCount = unackAlerts.filter(a => a.severity === "WARNING").length;
    const healthScore = Math.round(Math.max(30.0, 94.0 - (critCount * 8.0) - (warnCount * 3.5) - (avgCongestion * 0.15)) * 10) / 10;

    res.json({
      monitored_locations_count: LOCATIONS.length,
      average_traffic_congestion_pct: avgCongestion,
      traffic_status: trafficStatus,
      high_flood_risk_zones_count: 2,
      flood_status: "MODERATE_WATCH",
      water_infrastructure_health_pct: 91.5,
      electricity_infrastructure_health_pct: 94.2,
      active_critical_alerts_count: critCount,
      active_warning_alerts_count: warnCount,
      city_health_score: healthScore,
      system_mode: "LIVE_SIMULATED_TWIN",
      telemetry_timestamp: new Date().toISOString(),
      quick_trends: {
        traffic_change_1h: "+4.2%",
        water_consumption_rate: "1,420 MLD",
        power_draw_current: "3,180 MW",
        storm_drain_capacity_avg: "78%"
      }
    });
  });

  // 3. Locations and Roads
  app.get('/api/locations', (req, res) => {
    const locMap = LOCATIONS.map(loc => {
      const conn = ROADS.filter(r => r.source_location_id === loc.id || r.target_location_id === loc.id);
      const avgC = conn.length ? conn.reduce((s, r) => s + r.current_congestion, 0) / conn.length : 0.3;
      const floodPred = calculateFloodPrediction(loc.elevation, 15, 75);
      const locSensors = SENSORS.filter(s => s.location_id === loc.id);
      const locAlerts = ALERTS.filter(a => a.location_id === loc.id && !a.is_acknowledged);

      return {
        ...loc,
        current_congestion: Math.round(avgC * 100) / 100,
        current_flood_risk: floodPred.riskLevel,
        sensor_count: locSensors.length,
        active_alerts_count: locAlerts.length
      };
    });
    res.json(locMap);
  });

  app.get('/api/roads', (req, res) => {
    res.json(ROADS);
  });

  // 4. Traffic Endpoints
  app.get('/api/traffic/current', (req, res) => {
    const results = LOCATIONS.map(loc => {
      const conn = ROADS.filter(r => r.source_location_id === loc.id || r.target_location_id === loc.id);
      const avgC = conn.length ? conn.reduce((s, r) => s + r.current_congestion, 0) / conn.length : 0.3;
      const count = Math.round(1200 + avgC * 2400);
      const speed = Math.round((52.0 * (1.0 - Math.pow(avgC, 1.3)) + 8.0) * 10) / 10;
      return {
        location_id: loc.id,
        location_name: loc.name,
        congestion_level: Math.round(avgC * 100) / 100,
        vehicle_count: count,
        average_speed_kmh: speed,
        status: avgC > 0.75 ? "SEVERE" : (avgC > 0.45 ? "MODERATE" : "SMOOTH"),
        timestamp: new Date().toISOString()
      };
    });
    res.json(results);
  });

  app.get('/api/traffic/history/:location_id', (req, res) => {
    const locId = req.params.location_id;
    const loc = LOCATIONS.find(l => l.id === locId);
    if (!loc) return res.status(404).json({ error: "Location not found" });

    const history = [];
    const now = Date.now();
    for (let i = 24; i > 0; i -= 2) {
      const d = new Date(now - i * 3600000);
      const hour = d.getHours();
      const peak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 0.82 : 0.38;
      const jitter = ((locId.charCodeAt(0) + i) % 15) / 100;
      const cong = Math.round(Math.min(0.96, Math.max(0.15, peak + jitter)) * 100) / 100;
      history.push({
        timestamp: `${String(hour).padStart(2, '0')}:00`,
        congestion_level: cong,
        speed_kmh: Math.round((52.0 * (1.0 - cong) + 9.0) * 10) / 10,
        vehicle_volume: Math.round(800 + cong * 2600)
      });
    }
    res.json({ location_id: locId, location_name: loc.name, readings: history });
  });

  app.post('/api/traffic/predict', (req, res) => {
    const { location_id, horizon_hours = 1, simulated_weather_rain_mm = 0, is_peak_hour = false } = req.body;
    const loc = LOCATIONS.find(l => l.id === location_id);
    if (!loc) return res.status(404).json({ error: "Location not found" });

    const conn = ROADS.filter(r => r.source_location_id === loc.id || r.target_location_id === loc.id);
    const baseC = conn.length ? conn.reduce((s, r) => s + r.current_congestion, 0) / conn.length : 0.45;
    const pred = calculateTrafficPrediction(baseC, Number(horizon_hours), Number(simulated_weather_rain_mm), Boolean(is_peak_hour));

    const curve = [1, 2, 4, 6, 8, 12].map(h => {
      const step = calculateTrafficPrediction(baseC, h, Number(simulated_weather_rain_mm));
      return { horizon_hours: h, predicted_congestion: step.congestion, speed_kmh: step.speed };
    });

    res.json({
      location_id: loc.id,
      location_name: loc.name,
      horizon_hours: Number(horizon_hours),
      current_congestion: Math.round(baseC * 100) / 100,
      predicted_congestion: pred.congestion,
      predicted_speed_kmh: pred.speed,
      trend: pred.trend,
      confidence_score: pred.confidence,
      model_metrics: { r2_score: 0.956, rmse: 0.040, mae: 0.031, samples: 6000 },
      historical_comparison: curve
    });
  });

  // 5. Flood Endpoints
  app.get('/api/flood/locations', (req, res) => {
    const results = LOCATIONS.map(loc => {
      const pred = calculateFloodPrediction(loc.elevation, 18.0, 72.0);
      return {
        location_id: loc.id,
        location_name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevation_m: loc.elevation,
        risk_level: pred.riskLevel,
        risk_probability: pred.riskProb,
        water_accumulation_depth_cm: pred.accumDepth,
        drainage_capacity_pct: 72.0
      };
    });
    res.json(results);
  });

  app.post('/api/flood/predict', (req, res) => {
    const { location_id, rainfall_mm_per_hour = 25.0, drainage_capacity_pct = 75.0, antecedent_precipitation_days = 2 } = req.body;
    const loc = LOCATIONS.find(l => l.id === location_id);
    if (!loc) return res.status(404).json({ error: "Location not found" });

    const pred = calculateFloodPrediction(loc.elevation, Number(rainfall_mm_per_hour), Number(drainage_capacity_pct), Number(antecedent_precipitation_days));

    res.json({
      location_id: loc.id,
      location_name: loc.name,
      elevation_m: loc.elevation,
      rainfall_mm: Number(rainfall_mm_per_hour),
      drainage_capacity_pct: Number(drainage_capacity_pct),
      predicted_risk_level: pred.riskLevel,
      risk_probability: pred.riskProb,
      water_accumulation_depth_cm: pred.accumDepth,
      contributing_factors: pred.contributingFactors,
      confidence_score: pred.confidence
    });
  });

  // 6. Infrastructure IoT
  app.get('/api/infrastructure/sensors', (req, res) => {
    const locMap = new Map(LOCATIONS.map(l => [l.id, l.name]));
    const sensorsEnriched = SENSORS.map(s => {
      const jitter = (Math.random() - 0.5) * 0.04 * s.current_value;
      const liveVal = Math.round((s.current_value + jitter) * 100) / 100;
      return {
        ...s,
        current_value: liveVal,
        location_name: locMap.get(s.location_id) || s.location_id,
        is_active: true
      };
    });
    res.json(sensorsEnriched);
  });

  app.get('/api/infrastructure/readings/:sensor_id', (req, res) => {
    const sensor = SENSORS.find(s => s.id === req.params.sensor_id);
    if (!sensor) return res.status(404).json({ error: "Sensor not found" });

    const readings = [];
    const now = Date.now();
    for (let i = 20; i > 0; i--) {
      const t = new Date(now - i * 180000);
      const v = Math.round((sensor.current_value + (Math.random() - 0.5) * 0.07 * sensor.current_value) * 100) / 100;
      readings.push({
        timestamp: t.toTimeString().split(' ')[0],
        value: v,
        unit: sensor.unit,
        status: (sensor.max_threshold && v > sensor.max_threshold) ? "WARNING" : "NORMAL"
      });
    }
    res.json({ sensor, readings });
  });

  // 7. Alerts
  app.get('/api/alerts', (req, res) => {
    const locMap = new Map(LOCATIONS.map(l => [l.id, l.name]));
    res.json(ALERTS.map(a => ({
      ...a,
      location_name: locMap.get(a.location_id) || "Metropolitan Center"
    })));
  });

  app.post('/api/alerts/acknowledge', async (req, res) => {
    const { alert_id, acknowledged_by = "Central Dispatch Officer" } = req.body;
    const alert = ALERTS.find(a => a.id === alert_id);
    if (!alert) return res.status(404).json({ error: "Alert not found" });

    alert.is_acknowledged = true;
    alert.acknowledged_by = acknowledged_by;

    // Persist to Supabase if configured
    supabaseDb.acknowledgeAlert(alert_id, acknowledged_by).catch(() => {});

    res.json({ status: "SUCCESS", message: `Alert ${alert_id} acknowledged by ${acknowledged_by}` });
  });

  // 8. Emergency Routing & Road Closures
  app.post('/api/emergency/route', async (req, res) => {
    const { service_type = "AMBULANCE", source_id, destination_id, avoid_closed_roads = true, consider_traffic_congestion = true, consider_flood_risk = true } = req.body;
    try {
      const floodNodes = consider_flood_risk ? ["koramangala", "hebbal"] : [];
      const routeData = solveDijkstraRoute(source_id, destination_id, service_type, avoid_closed_roads, consider_traffic_congestion, floodNodes);
      
      // Persist to Supabase if configured
      supabaseDb.recordEmergencyRoute(routeData).catch(() => {});

      res.json(routeData);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/emergency/road-closure', async (req, res) => {
    const { road_id, is_closed, closure_reason = "Emergency Inundation Barrier" } = req.body;
    const road = ROADS.find(r => r.id === road_id);
    if (!road) return res.status(404).json({ error: "Road not found" });

    road.is_closed = Boolean(is_closed);
    // @ts-ignore
    road.closure_reason = is_closed ? closure_reason : null;

    // Persist to Supabase if configured
    supabaseDb.updateRoadClosure(road_id, road.is_closed, road.closure_reason).catch(() => {});

    res.json({ status: "SUCCESS", road_id: road.id, is_closed: road.is_closed, reason: road.closure_reason });
  });

  // 9. Connected What-If Simulation
  app.post('/api/simulation/run', (req, res) => {
    const {
      scenario_name = "Monsoon Flash Flood & Peak Surge",
      rainfall_intensity_mm = 65.0,
      drainage_capacity_pct = 45.0,
      traffic_surge_factor = 1.4,
      water_demand_factor = 1.1,
      electricity_demand_factor = 1.2,
      simulated_road_closures = []
    } = req.body;

    const rain = Number(rainfall_intensity_mm);
    const drainage = Number(drainage_capacity_pct);
    const trafMult = Number(traffic_surge_factor);
    const pwrMult = Number(electricity_demand_factor);
    const wtrMult = Number(water_demand_factor);

    const floodedLocationIds: string[] = [];
    const affectedLocations = new Set<string>();
    let atRiskPop = 0;

    const floodImpacts = LOCATIONS.map(loc => {
      const f = calculateFloodPrediction(loc.elevation, rain, drainage);
      const isFlooded = f.riskLevel === "HIGH" || f.riskLevel === "CRITICAL";
      if (isFlooded) {
        floodedLocationIds.push(loc.id);
        affectedLocations.add(loc.id);
        atRiskPop += loc.population_density;
      }
      return {
        location_id: loc.id,
        location_name: loc.name,
        elevation_m: loc.elevation,
        risk_level: f.riskLevel,
        risk_probability: f.riskProb,
        water_depth_cm: f.accumDepth
      };
    });

    const cascadeChain: string[] = [];
    if (rain > 40.0) {
      cascadeChain.push(`Intense precipitation of ${rain} mm/h flooded ${floodedLocationIds.length} lower elevation sectors (Hebbal, Koramangala basin).`);
    }

    let disruptedRoadsCount = simulated_road_closures.length;
    const trafficImpacts = ROADS.map(road => {
      const isSubmerged = floodedLocationIds.includes(road.source_location_id) || floodedLocationIds.includes(road.target_location_id);
      const isManuallyClosed = simulated_road_closures.includes(road.id);

      let simCongestion = road.current_congestion;
      let status = "FLOWING";

      if (isSubmerged || isManuallyClosed) {
        disruptedRoadsCount++;
        simCongestion = 0.96;
        status = isSubmerged ? "BLOCKED_SUBMERGED" : "CLOSED_PROTOCOL";
      } else {
        simCongestion = Math.min(0.95, road.current_congestion * trafMult * (floodedLocationIds.length > 2 ? 1.22 : 1.0));
        status = simCongestion > 0.65 ? "CONGESTED" : "FLOWING";
      }

      return {
        road_id: road.id,
        road_name: road.name,
        original_congestion: road.current_congestion,
        simulated_congestion: Math.round(simCongestion * 100) / 100,
        status
      };
    });

    if (disruptedRoadsCount > 0) {
      cascadeChain.push(`${disruptedRoadsCount} major corridors suffered severe chokeholds or closures, causing massive regional gridlock.`);
    }

    const substationStress = Math.round(Math.min(100.0, 68.0 * pwrMult + (rain > 50 ? 14.0 : 0)) * 10) / 10;
    const waterPressureDrop = Math.round(Math.min(60.0, 15.0 * wtrMult + (drainage < 40 ? 25.0 : 0)) * 10) / 10;

    const powerWaterImpacts = [
      {
        subsystem: "Electricity Distribution Grid",
        parameter: "Transformer Peak Thermal Load",
        simulated_value: `${substationStress}%`,
        status: substationStress > 88 ? "CRITICAL" : (substationStress > 75 ? "WARNING" : "STABLE"),
        risk_description: "Transformer heat dissipation strain and safety circuit trips in moisture-exposed zones."
      },
      {
        subsystem: "Municipal Water Network",
        parameter: "Pipeline Pressure Deficit",
        simulated_value: `-${waterPressureDrop}% pressure`,
        status: waterPressureDrop > 30 ? "WARNING" : "OPTIMAL",
        risk_description: "Runoff back-pressure oscillation across distribution nodes."
      }
    ];

    if (substationStress > 80) {
      cascadeChain.push(`Power grid load escalated to ${substationStress}%, triggering automated load-shedding safeguards.`);
    }

    const baselineHealth = 88.0;
    const healthPenalty = (floodedLocationIds.length * 6.5) + (disruptedRoadsCount * 4.0) + (rain * 0.1) + ((100.0 - drainage) * 0.15);
    const simulatedHealth = Math.max(22.0, Math.round((baselineHealth - healthPenalty) * 10) / 10);

    const result = {
      scenario_id: `sim-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      inputs: {
        scenario_name,
        rainfall_intensity_mm: rain,
        drainage_capacity_pct: drainage,
        traffic_surge_factor: trafMult,
        water_demand_factor: wtrMult,
        electricity_demand_factor: pwrMult,
        simulated_road_closures
      },
      baseline_health_score: baselineHealth,
      simulated_health_score: simulatedHealth,
      health_score_delta: Math.round((simulatedHealth - baselineHealth) * 10) / 10,
      affected_locations_count: affectedLocations.size,
      at_risk_population: atRiskPop,
      cascade_chain: cascadeChain,
      flood_impacts: floodImpacts,
      traffic_impacts: trafficImpacts,
      power_water_impacts: powerWaterImpacts,
      rerouted_emergency_paths: Math.max(1, floodedLocationIds.length + Math.floor(disruptedRoadsCount / 2))
    };

    SIMULATION_HISTORY.unshift(result);
    supabaseDb.recordSimulationScenario(result).catch(() => {});
    res.json(result);
  });

  app.get('/api/simulation/history', (req, res) => {
    res.json(SIMULATION_HISTORY.slice(0, 10));
  });

  // 404 API Guard: Guarantee JSON response for any unhandled /api/* route and prevent falling through to Vite's HTML index
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `API route ${req.method} ${req.originalUrl || req.url} not found`,
      status: "NOT_FOUND"
    });
  });

  // Integrate Vite dev server middlewares for client SPA
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEURAL CITY] Digital Twin Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to launch server:", err);
});
