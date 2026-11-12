import React, { useState } from 'react';
import { 
  Activity, 
  MapPin, 
  TrendingUp, 
  CloudRain, 
  Droplet, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';
import { DashboardOverview, AlertItem, CityLocation, CityRoad } from '../services/api';

interface CityOverviewProps {
  overview: DashboardOverview | null;
  alerts: AlertItem[];
  locations: CityLocation[];
  roads: CityRoad[];
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  setActiveModule: (m: string) => void;
  isLoading: boolean;
}

export const CityOverview: React.FC<CityOverviewProps> = ({
  overview,
  alerts,
  locations,
  roads,
  onAcknowledgeAlert,
  setActiveModule,
  isLoading,
}) => {
  const [ackLoading, setAckLoading] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    setAckLoading(id);
    try {
      await onAcknowledgeAlert(id);
    } finally {
      setAckLoading(null);
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono tracking-wide">Syncing Bengaluru Digital Twin telemetry...</p>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter(a => !a.is_acknowledged);

  return (
    <div className="space-y-6">
      {/* Top Banner: Digital Twin State & Health Score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1.5" />
                LIVE AUTONOMOUS TWIN
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Model: Hydro-Ensemble & Spatial Harmonics
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Metropolitan Bengaluru Infrastructure Pulse
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time neural monitoring across 9 high-capacity corridors, automated flood depression analysis, 
              hydraulic pressure telemetry, and sub-second emergency route optimization.
            </p>
          </div>

          {/* Infrastructure Health Score Circular Display */}
          <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800 p-4 rounded-xl shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="text-slate-800"
                  strokeWidth="7"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (213.6 * (overview?.city_health_score || 88.5)) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold font-mono text-white">
                  {overview?.city_health_score || 88.5}
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-400">Score</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Twin Health Status
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GRID STABLE & ACTIVE</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Baseline 88.0 • 0 Severe Outages
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary 6 Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Monitored Locations */}
        <div 
          onClick={() => setActiveModule('map')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monitored Zones</span>
            <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {overview?.monitored_locations_count || locations.length || 9}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Bengaluru Core</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
          </div>
        </div>

        {/* 2. Traffic Congestion */}
        <div 
          onClick={() => setActiveModule('traffic')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Congestion</span>
            <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {overview?.average_traffic_congestion_pct || 58.2}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-amber-300 font-semibold">{overview?.traffic_status || 'MODERATE'}</span>
            <span className="text-slate-500 font-mono">{overview?.quick_trends.traffic_change_1h || '+4.2%'}</span>
          </div>
        </div>

        {/* 3. Flood Risk Zones */}
        <div 
          onClick={() => setActiveModule('flood')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Flood Risk Zones</span>
            <CloudRain className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {overview?.high_flood_risk_zones_count || 2} <span className="text-xs text-slate-400 font-sans font-normal">Active</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-cyan-300 font-semibold">Hebbal & Koramangala</span>
            <span className="text-slate-500 font-mono">Watch</span>
          </div>
        </div>

        {/* 4. Water Network Health */}
        <div 
          onClick={() => setActiveModule('infrastructure')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Water Grid</span>
            <Droplet className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-teal-400 font-mono">
            {overview?.water_infrastructure_health_pct || 91.5}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{overview?.quick_trends.water_consumption_rate || '1,420 MLD'}</span>
            <span className="text-emerald-400 font-bold">NORMAL</span>
          </div>
        </div>

        {/* 5. Electricity Grid Health */}
        <div 
          onClick={() => setActiveModule('infrastructure')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-yellow-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Power Grid</span>
            <Zap className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-yellow-400 font-mono">
            {overview?.electricity_infrastructure_health_pct || 94.2}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{overview?.quick_trends.power_draw_current || '3,180 MW'}</span>
            <span className="text-emerald-400 font-bold">OPTIMAL</span>
          </div>
        </div>

        {/* 6. Active Alerts */}
        <div 
          onClick={() => setActiveModule('alerts')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 p-4 rounded-xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {unacknowledgedAlerts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-rose-400 font-semibold">{overview?.active_critical_alerts_count || 1} Critical</span>
            <span className="text-amber-400">{overview?.active_warning_alerts_count || 2} Warn</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Live Incident Feed & Quick Corridor Map Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monitored Corridors & Telemetry Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Key Arterial Corridor Status (Bengaluru Digital Twin)</h3>
              </div>
              <button 
                onClick={() => setActiveModule('map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Full GIS View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of high-priority corridors */}
            <div className="space-y-2.5">
              {roads.slice(0, 5).map((road) => {
                const congPct = Math.round(road.current_congestion * 100);
                const isCrit = congPct > 75;
                const isWarn = congPct > 50 && !isCrit;

                return (
                  <div 
                    key={road.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-200 truncate">{road.name}</span>
                        {road.is_closed ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                            ROAD CLOSED
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">{road.distance_km} km • {road.lanes} Lanes</span>
                        )}
                      </div>
                      
                      {/* Congestion progress bar */}
                      <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCrit ? 'bg-rose-500' : (isWarn ? 'bg-amber-400' : 'bg-emerald-400')
                          }`}
                          style={{ width: `${congPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-mono font-bold text-sm ${
                        isCrit ? 'text-rose-400' : (isWarn ? 'text-amber-400' : 'text-emerald-400')
                      }`}>
                        {congPct}%
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {Math.round(road.speed_limit_kmh * (1 - road.current_congestion * 0.7))} km/h avg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Subsystems Status row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Stormwater Capacity</span>
                <span className="font-mono text-cyan-400">78% AVG</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '78%' }} />
              </div>
              <p className="text-[10px] text-slate-500">KBS & Silk Board sumps running automated cycle</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Transformer Load</span>
                <span className="font-mono text-amber-400">68.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '68.4%' }} />
              </div>
              <p className="text-[10px] text-slate-500">Hebbal & Whitefield 220kV sub-stations stable</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Hydraulic Pressure</span>
                <span className="font-mono text-teal-400">3.8 BAR</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-[10px] text-slate-500">Micro-pressure variance detected in KR Market</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Critical Incident Center */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-white text-sm">Active Incident Center</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
                {unacknowledgedAlerts.length} Active
              </span>
            </div>

            {unacknowledgedAlerts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">No Unacknowledged Alerts</p>
                <p className="text-[11px] text-slate-500">All city infrastructure subsystems reporting within parameters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unacknowledgedAlerts.slice(0, 4).map((alert) => (
                  <div 
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {alert.alert_type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100">{alert.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{alert.description}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Zone: {alert.location_name}
                      </span>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={ackLoading === alert.id}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50"
                      >
                        {ackLoading === alert.id ? 'Saving...' : 'Acknowledge'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveModule('alerts')}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Complete Alert History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
