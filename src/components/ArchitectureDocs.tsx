import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  Terminal, 
  Database, 
  Server, 
  Cpu, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export const ArchitectureDocs: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState<boolean>(true);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isConnectingKey, setIsConnectingKey] = useState<boolean>(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);
  const [verifyReport, setVerifyReport] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleRunVerification = async (keyOverride?: string) => {
    setIsVerifying(true);
    try {
      const key = keyOverride || (apiKeyInput.trim() || undefined);
      const report = await api.verifyDatabase(key, 'https://elsokyjtebkbncapuxkm.supabase.co');
      setVerifyReport(report);
      await fetchDbStatus();
    } catch (e: any) {
      setVerifyReport({
        connected: false,
        url: 'https://elsokyjtebkbncapuxkm.supabase.co',
        verified_tables_count: 0,
        total_tables_count: 11,
        tables: [],
        read_write_test: { success: false, error: e.message },
        error: e.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConnectKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsConnectingKey(true);
    setConnectMessage(null);
    try {
      const res = await api.configureDatabase(apiKeyInput.trim(), 'https://elsokyjtebkbncapuxkm.supabase.co');
      setConnectMessage(res.message);
      await fetchDbStatus();
      await handleRunVerification(apiKeyInput.trim());
    } catch (e: any) {
      setConnectMessage(`Connection error: ${e.message}`);
    } finally {
      setIsConnectingKey(false);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await api.getDatabaseStatus();
      setDbStatus(res);
      if (res.connected && !verifyReport) {
        handleRunVerification();
      }
    } catch (e) {
      console.error("Error fetching db status:", e);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncDatabase();
      setSyncMessage(res.message);
      await fetchDbStatus();
    } catch (e: any) {
      setSyncMessage(`Sync error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const endpoints = [
    { method: "GET", path: "/api/dashboard/overview", desc: "Aggregated city health, alert metrics, and multi-system summary" },
    { method: "GET", path: "/api/locations", desc: "List all 9 Bengaluru demonstration GIS nodes with telemetry properties" },
    { method: "GET", path: "/api/roads", desc: "Road network graph edges with distances, lanes, speed limits, and congestion" },
    { method: "GET", path: "/api/traffic/current", desc: "Live vehicle speeds, volume, and congestion levels per corridor" },
    { method: "GET", path: "/api/traffic/history/{location_id}", desc: "24-hour historical traffic readings for corridor time-series" },
    { method: "POST", path: "/api/traffic/predict", desc: "AI Random Forest traffic prediction for +1h, +2h, +4h, +6h, +12h" },
    { method: "GET", path: "/api/flood/locations", desc: "Current flood vulnerability scores, water accumulation, and elevation" },
    { method: "POST", path: "/api/flood/predict", desc: "Hydrological AI model predicting LOW/MODERATE/HIGH/CRITICAL flood risk" },
    { method: "GET", path: "/api/infrastructure/sensors", desc: "Simulated SCADA/IoT sensors across water pipelines and power substations" },
    { method: "GET", path: "/api/infrastructure/readings/{sensor_id}", desc: "20-point historical telemetry series for selected sensor" },
    { method: "GET", path: "/api/alerts", desc: "Active and historical city alerts with severity levels" },
    { method: "POST", path: "/api/alerts/acknowledge", desc: "Operator acknowledgment of active incident alerts" },
    { method: "POST", path: "/api/emergency/route", desc: "Dijkstra graph shortest-path router considering traffic, closures, and flooding" },
    { method: "POST", path: "/api/emergency/road-closure", desc: "Dynamically barricade or reopen road corridors" },
    { method: "POST", path: "/api/simulation/run", desc: "Execute connected multi-variable cascade simulation scenario" },
    { method: "GET", path: "/api/simulation/history", desc: "Retrieve past scenario execution results" },
    { method: "GET", path: "/api/database/status", desc: "Inspect Supabase PostgreSQL connection status and available tables" },
    { method: "POST", path: "/api/database/sync", desc: "Sync in-memory digital twin state to Supabase PostgreSQL database" },
    { method: "GET", path: "/api/health", desc: "System health check and database connectivity verification" },
  ];

  const dbTables = [
    { name: "locations", desc: "Demonstration city wards, coordinates (lat/lng), elevation (AMSL), and population" },
    { name: "roads", desc: "Directed/undirected road corridors, speed limits, capacity (vph), lanes, and closure flags" },
    { name: "traffic_readings", desc: "Real-time & simulated vehicle counts, average crawl speeds, and congestion indices" },
    { name: "traffic_predictions", desc: "Scikit-learn model inference outputs, forecast horizons, and confidence scores" },
    { name: "flood_observations", desc: "Precipitation gauge readings (mm/h), water levels (m), and drainage capacities" },
    { name: "flood_predictions", desc: "Hydrological classification results (LOW to CRITICAL) and contributing factors" },
    { name: "infrastructure_sensors", desc: "SCADA sensor metadata, engineering units, and min/max trip thresholds" },
    { name: "sensor_readings", desc: "High-frequency telemetry time-series logs for water flow, pressure, and voltage" },
    { name: "alerts", desc: "System warnings, severity indices (WARNING, CRITICAL), and operator resolution logs" },
    { name: "simulation_scenarios", desc: "Multi-parameter what-if run records, input vectors, and cascading impacts" },
    { name: "emergency_routes", desc: "Calculated emergency path logs, turn-by-turn waypoints, and avoided hazards" },
  ];

  const supabaseSqlSchema = `-- ========================================================
-- PROJECT NEURAL CITY – SUPABASE POSTGRESQL SCHEMA DDL
-- Paste directly into your Supabase Dashboard SQL Editor
-- ========================================================

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

CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id TEXT REFERENCES infrastructure_sensors(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    value DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'NORMAL',
    simulated BOOLEAN DEFAULT TRUE
);

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
);`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
            ENGINEERING SPECIFICATION & CLOUD DATABASE
          </span>
          <span className="text-xs text-slate-400 font-mono">
            FastAPI / Supabase PostgreSQL / Scikit-learn / NetworkX
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          System Architecture, APIs & Supabase Integration
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Comprehensive documentation of the NEURAL CITY digital twin ecosystem. 
          Contains exact commands to run the FastAPI backend, Supabase PostgreSQL schema DDL, 
          ML training pipelines, and REST API schemas.
        </p>
      </div>

      {/* Supabase Integration Live Status Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-800/60 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Supabase PostgreSQL Integration</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                  dbStatus?.connected 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                    : (dbStatus?.configured ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-slate-800 text-slate-400 border-slate-700')
                }`}>
                  {dbStatus?.connected ? 'CONNECTED TO SUPABASE' : (dbStatus?.configured ? 'CREDENTIALS DETECTED' : 'LOCAL PERSISTENCE ACTIVE')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PostgreSQL cloud database for digital twin persistent state across sessions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => copyToClipboard(supabaseSqlSchema, 'supabase-ddl-top')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
              title="Copy complete 11-table SQL script for Supabase SQL Editor"
            >
              {copiedCmd === 'supabase-ddl-top' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd === 'supabase-ddl-top' ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>

            <button
              onClick={() => setShowSqlViewer(!showSqlViewer)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              {showSqlViewer ? 'Hide Schema SQL' : 'View Supabase DDL SQL'}
            </button>

            <button
              onClick={handleSyncDatabase}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-purple-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
            </button>

            <button
              onClick={() => handleRunVerification()}
              disabled={isVerifying}
              className="px-3.5 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying 11 Tables...' : 'Verify All 11 Tables'}</span>
            </button>
          </div>
        </div>

        {/* Supabase Key Connector Card */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-purple-800/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <h4 className="font-bold text-xs text-white">Connect Your Supabase Project API Key</h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target Project: <span className="font-mono text-cyan-400 font-bold">https://elsokyjtebkbncapuxkm.supabase.co</span>
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Find key in Supabase → Settings (⚙) → API → Project API keys (anon public)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your Supabase anon / public key (ey... or sb_...)"
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-purple-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleConnectKey}
              disabled={isConnectingKey || !apiKeyInput.trim()}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isConnectingKey ? 'animate-spin' : ''}`} />
              <span>{isConnectingKey ? 'Verifying...' : 'Connect & Run Tests'}</span>
            </button>
          </div>

          {connectMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
              dbStatus?.connected ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-purple-950/80 text-purple-200 border border-purple-800'
            }`}>
              {dbStatus?.connected ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span>{connectMessage}</span>
            </div>
          )}
        </div>

        {/* Verification Report Card */}
        {verifyReport && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${verifyReport.connected ? 'text-emerald-400' : 'text-amber-400'}`} />
                <h4 className="font-bold text-sm text-white">
                  Database Verification Diagnostic Report ({verifyReport.verified_tables_count}/{verifyReport.total_tables_count || 11} Tables Verified)
                </h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                verifyReport.connected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {verifyReport.connected ? 'SUPABASE_POSTGRES_VERIFIED' : 'LOCAL_STORAGE_ACTIVE'}
              </span>
            </div>

            {/* Read/Write Test Results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Write Test</span>
                <div className={`font-mono font-bold flex items-center gap-1 ${
                  verifyReport.read_write_test?.write_record_id ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {verifyReport.read_write_test?.write_record_id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Record #{verifyReport.read_write_test.write_record_id} Inserted</span>
                    </>
                  ) : (
                    <span>{verifyReport.read_write_test?.error || 'Ready to test'}</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Read Test</span>
                <div className={`font-mono font-bold flex items-center gap-1 ${
                  verifyReport.read_write_test?.read_record_verified ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {verifyReport.read_write_test?.read_record_verified ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Read-back Verified</span>
                    </>
                  ) : (
                    <span>Awaiting Write</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Cleanup / Teardown</span>
                <div className="font-mono text-cyan-400 font-bold truncate">
                  {verifyReport.read_write_test?.cleanup_status || 'IDLE'}
                </div>
              </div>
            </div>

            {/* Table-by-Table Status Badges */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Schema Tables Status & Live Row Counts
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {verifyReport.tables?.map((table: any) => (
                  <div 
                    key={table.name} 
                    className={`p-2 rounded-lg border text-left space-y-0.5 ${
                      table.exists 
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold truncate">{table.name}</span>
                      {table.exists ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-slate-500">Pending</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {table.exists ? `${table.row_count} rows` : (table.error ? 'Table missing' : 'Not queried')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {syncMessage && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-200 font-mono">
            {syncMessage}
          </div>
        )}

        {/* Live database telemetry details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Endpoint / Project</span>
            <div className="font-mono text-cyan-400 truncate text-[11px]">
              {dbStatus?.endpoint || 'https://elsokyjtebkbncapuxkm.supabase.co'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Operational Mode</span>
            <div className="font-mono text-emerald-400 font-bold">
              {dbStatus?.mode || 'ACTIVE_STORAGE_READY'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Target Tables</span>
            <div className="font-mono text-purple-400 font-bold">
              11 Tables Defined in Schema
            </div>
          </div>
        </div>

        {/* Expandable SQL Viewer with Copy Button */}
        {showSqlViewer && (
          <div className="space-y-2 pt-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Complete Supabase SQL DDL (Ready for Supabase SQL Editor)
              </span>
              <button
                onClick={() => copyToClipboard(supabaseSqlSchema, 'supabase-ddl')}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono font-bold"
              >
                {copiedCmd === 'supabase-ddl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'supabase-ddl' ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-purple-300 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-72 overflow-y-auto select-all">
              {supabaseSqlSchema}
            </pre>
          </div>
        )}
      </div>

      {/* Windows PowerShell Quick Launch Commands */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-white text-base">
              Windows PowerShell Execution Commands
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">PowerShell 5.1 / 7+</span>
        </div>

        <div className="space-y-3">
          {/* Step 1: Backend venv */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">1. Setup Python Virtual Environment & Install Dependencies</span>
              <button
                onClick={() => copyToClipboard(`cd backend\npython -m venv venv\n.\\venv\\Scripts\\Activate.ps1\npip install -r requirements.txt`, 'step1')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCmd === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step1' ? 'Copied!' : 'Copy PowerShell'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
{`cd backend
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
pip install -r requirements.txt`}
            </pre>
          </div>

          {/* Step 2: Initialize & Seed Database */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">2. Initialize Tables & Seed Demonstration Records</span>
              <button
                onClick={() => copyToClipboard(`python -m backend.app.db_init`, 'step2-db')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCmd === 'step2-db' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step2-db' ? 'Copied!' : 'Copy PowerShell'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
{`python -m backend.app.db_init`}
            </pre>
          </div>

          {/* Step 3: Train ML Models */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">3. Train AI Traffic & Flood Prediction Models</span>
              <button
                onClick={() => copyToClipboard(`python backend/app/ml/train_traffic.py\npython backend/app/ml/train_flood.py`, 'step2')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCmd === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step2' ? 'Copied!' : 'Copy PowerShell'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
{`python backend/app/ml/train_traffic.py
python backend/app/ml/train_flood.py`}
            </pre>
          </div>

          {/* Step 4: Run Backend Tests */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">4. Run Pytest Backend Test Suite</span>
              <button
                onClick={() => copyToClipboard(`pytest backend/app/tests/test_api.py -v`, 'step3')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCmd === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step3' ? 'Copied!' : 'Copy PowerShell'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
{`pytest backend/app/tests/test_api.py -v`}
            </pre>
          </div>

          {/* Step 5: Start FastAPI Server */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">5. Start FastAPI Backend Server (Uvicorn on Port 8000)</span>
              <button
                onClick={() => copyToClipboard(`uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`, 'step4')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCmd === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step4' ? 'Copied!' : 'Copy PowerShell'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
{`uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload`}
            </pre>
            <div className="text-[11px] text-slate-400">
              Interactive Swagger API Documentation will be available at: <span className="font-mono text-cyan-400">http://localhost:8000/docs</span>
            </div>
          </div>

          {/* Step 6: Start Frontend */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">6. Start React + Vite Development Frontend (Port 3000)</span>
              <button
                onClick={() => copyToClipboard(`npm install\nnpm run dev`, 'step5')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                {copiedCmd === 'step5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === 'step5' ? 'Copied!' : 'Copy PowerShell'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
{`npm install
npm run dev`}
            </pre>
          </div>
        </div>
      </div>

      {/* REST API Endpoints Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-white text-base">
              Connected REST API Endpoints ({endpoints.length} Routes)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">FastAPI OpenAPI 3.1</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5 font-mono">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  ep.method === 'GET' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {ep.method}
                </span>
                <span className="text-slate-200 font-bold">{ep.path}</span>
              </div>
              <span className="text-slate-400 text-[11px] max-w-md">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-white text-base">
              SQLAlchemy & PostgreSQL Database Schema (11 Tables)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">SQLAlchemy 2.0 ORM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dbTables.map((t, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="font-mono font-bold text-xs text-slate-200">{t.name}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
