import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  RefreshCw, 
  Zap, 
  Sliders, 
  AlertTriangle,
  Database
} from 'lucide-react';
import { DashboardOverview } from '../services/api';

interface HeaderProps {
  overview: DashboardOverview | null;
  activeModule: string;
  setActiveModule: (m: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  setAutoRefresh: (b: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  overview,
  activeModule,
  setActiveModule,
  isRefreshing,
  onRefresh,
  autoRefresh,
  setAutoRefresh,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
      {/* Brand & Digital Twin identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-black tracking-wider">
          <Activity className="w-5 h-5 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              NEURAL CITY
            </h1>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              Digital Twin v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            AI Urban Infrastructure Digital Twin • Bengaluru Demonstration Area
          </p>
        </div>
      </div>

      {/* Quick live telemetry pill counters */}
      <div className="hidden lg:flex items-center gap-3">
        {/* City Health Score */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">City Health:</span>
          <span className="font-mono font-bold text-emerald-400">
            {overview ? `${overview.city_health_score}%` : '88.5%'}
          </span>
        </div>

        {/* Monitored locations */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Monitored:</span>
          <span className="font-mono font-bold text-slate-200">
            {overview ? overview.monitored_locations_count : 9} Nodes
          </span>
        </div>

        {/* Traffic Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Congestion:</span>
          <span className="font-mono font-bold text-amber-400">
            {overview ? `${overview.average_traffic_congestion_pct}%` : '58.2%'}
          </span>
        </div>

        {/* Active Critical Alerts */}
        <button
          onClick={() => setActiveModule('alerts')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs hover:bg-rose-900/40 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-300">Active Alerts:</span>
          <span className="font-mono font-bold text-rose-400">
            {overview ? overview.active_critical_alerts_count + overview.active_warning_alerts_count : 3}
          </span>
        </button>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-2">
        {/* Quick Supabase DDL & Architecture trigger */}
        <button
          onClick={() => setActiveModule('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeModule === 'architecture'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'bg-purple-950/70 hover:bg-purple-900/70 text-purple-200 border border-purple-800/70'
          }`}
          title="Open Supabase DDL SQL Schema & Architecture Docs"
        >
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold">Supabase DDL / Docs</span>
        </button>

        {/* Quick Simulation trigger */}
        <button
          onClick={() => setActiveModule('simulation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeModule === 'simulation'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">What-If Sim</span>
        </button>

        {/* Quick Emergency Dispatch trigger */}
        <button
          onClick={() => setActiveModule('emergency')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeModule === 'emergency'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Emergency Dispatch</span>
        </button>

        {/* Auto-refresh toggle */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          title={autoRefresh ? "Live polling active (every 10s)" : "Live polling paused"}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            autoRefresh 
              ? 'bg-cyan-950/60 border-cyan-700 text-cyan-400' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-cyan-400' : ''}`} />
        </button>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-50"
          title="Refresh All Telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
