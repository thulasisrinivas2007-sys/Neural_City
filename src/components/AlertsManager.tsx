import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ShieldAlert, 
  CheckCheck, 
  Search, 
  MapPin, 
  TrendingUp, 
  CloudRain, 
  Droplet, 
  Zap,
  Info
} from 'lucide-react';
import { AlertItem } from '../services/api';

interface AlertsManagerProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
  onRefreshAlerts: () => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  onAcknowledgeAlert,
  onRefreshAlerts,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ackLoading, setAckLoading] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    setAckLoading(id);
    try {
      await onAcknowledgeAlert(id);
    } finally {
      setAckLoading(null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.location_name.toLowerCase().includes(q);
    }
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'TRAFFIC_GRIDLOCK':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case 'FLOOD_SURGE':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'WATER_LEAK':
        return <Droplet className="w-4 h-4 text-teal-400" />;
      case 'POWER_OVERLOAD':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
                CENTRAL DISPATCH INCIDENT LOG
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Real-Time Telemetry Threshold Monitor
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Urban Infrastructure Alerts & Incident Command
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Monitors automated telemetry breaches across traffic bottlenecks, storm runoff surcharges, 
              pipeline micro-leakages, and transformer thermal spikes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Total Incidents: <b className="text-white">{alerts.length}</b> • Pending: <b className="text-rose-400">{alerts.filter(a => !a.is_acknowledged).length}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === 'ALL'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            All Severities ({alerts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('CRITICAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              severityFilter === 'CRITICAL'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>Critical ({alerts.filter(a => a.severity === 'CRITICAL').length})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('WARNING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              severityFilter === 'WARNING'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Warnings ({alerts.filter(a => a.severity === 'WARNING').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident, location, keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-extrabold text-white text-base">No Matching Incidents</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no active incidents matching your filter criteria. All monitored sectors are within baseline parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alert.is_acknowledged
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                    : (isCrit ? 'bg-slate-900 border-rose-800/80 shadow-lg shadow-rose-950/20' : 'bg-slate-900 border-amber-800/60')
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    isCrit ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCrit ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{alert.location_name}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{alert.description}</p>

                    {alert.is_acknowledged && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono pt-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Acknowledged by {alert.acknowledged_by || 'Central Dispatch'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acknowledge Button */}
                {!alert.is_acknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={ackLoading === alert.id}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shrink-0 self-start md:self-center disabled:opacity-50"
                  >
                    {ackLoading === alert.id ? 'Updating...' : 'Acknowledge Incident'}
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 self-start md:self-center px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    Resolved
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
