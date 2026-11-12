import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Zap, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  Activity, 
  RefreshCw, 
  Thermometer, 
  Sliders, 
  Clock, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';
import { InfrastructureSensor, api } from '../services/api';

interface InfrastructureMonitoringProps {
  sensors: InfrastructureSensor[];
  onRefreshSensors: () => void;
}

export const InfrastructureMonitoring: React.FC<InfrastructureMonitoringProps> = ({
  sensors,
  onRefreshSensors,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'WATER' | 'POWER'>('ALL');
  const [selectedSensor, setSelectedSensor] = useState<InfrastructureSensor | null>(sensors[0] || null);
  const [readingsHistory, setReadingsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const fetchReadings = async (sensorId: string) => {
    setHistoryLoading(true);
    try {
      const res = await api.getSensorReadings(sensorId);
      setReadingsHistory(res.readings || []);
    } catch (e) {
      console.error("Error fetching readings:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSensor) {
      fetchReadings(selectedSensor.id);
    }
  }, [selectedSensor?.id]);

  const filteredSensors = sensors.filter(s => {
    if (filterType === 'WATER') return s.sensor_type.startsWith('WATER');
    if (filterType === 'POWER') return s.sensor_type.startsWith('POWER') || s.sensor_type === 'TRANSFORMER_TEMP';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return { bg: 'bg-rose-950 text-rose-400 border-rose-800', dot: 'bg-rose-400 animate-ping' };
      case 'WARNING':
        return { bg: 'bg-amber-950 text-amber-400 border-amber-800', dot: 'bg-amber-400' };
      default:
        return { bg: 'bg-emerald-950 text-emerald-400 border-emerald-800', dot: 'bg-emerald-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950/80 text-purple-400 border border-purple-800">
                SCADA / IOT DIGITAL SENSORS
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Municipal Water & 220kV Grid Telemetry
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Urban Infrastructure Telemetry & Health Monitoring
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time monitoring across primary municipal feeder pipes, stormwater valley outfalls, 
              transformer oil thermal sensors, and high-voltage distribution buses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshSensors}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Poll Sensors</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'ALL'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            All Subsystems ({sensors.length})
          </button>
          <button
            onClick={() => setFilterType('WATER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'WATER'
                ? 'bg-teal-500 text-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Water Network</span>
          </button>
          <button
            onClick={() => setFilterType('POWER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'POWER'
                ? 'bg-yellow-500 text-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Power & Substations</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          *Simulated IoT Readings with periodic fluctuation
        </span>
      </div>

      {/* Main Grid: Sensors List & Inspection Graph Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensors Cards Grid (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSensors.map((sensor) => {
            const isSelected = selectedSensor?.id === sensor.id;
            const badge = getStatusBadge(sensor.status);
            const isWater = sensor.sensor_type.startsWith('WATER');

            return (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isWater ? 'bg-teal-500/10 text-teal-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {isWater ? <Droplet className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        {sensor.location_name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{sensor.name}</h4>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 shrink-0 ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    <span>{sensor.status}</span>
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white">
                    {sensor.current_value} <span className="text-xs font-sans font-normal text-slate-400">{sensor.unit}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Safe: {sensor.min_threshold || 0} - {sensor.max_threshold || 100} {sensor.unit}
                  </span>
                </div>

                {/* Progress in threshold */}
                <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sensor.status === 'CRITICAL' ? 'bg-rose-500' : (sensor.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-400')
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(10, ((sensor.current_value - (sensor.min_threshold || 0)) / ((sensor.max_threshold || 100) - (sensor.min_threshold || 0))) * 100))}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Sensor Deep-Dive Telemetry Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {selectedSensor ? (
            <>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Active Sensor Inspection
                </span>
                <h3 className="font-extrabold text-white text-base">{selectedSensor.name}</h3>
                <p className="text-xs text-slate-400">
                  Zone: {selectedSensor.location_name} • Type: {selectedSensor.sensor_type}
                </p>
              </div>

              {/* Current value display */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400">Real-Time Reading</span>
                <div className="text-3xl font-black font-mono text-cyan-400">
                  {selectedSensor.current_value} {selectedSensor.unit}
                </div>
                <span className={`text-[10px] font-bold ${
                  selectedSensor.status === 'CRITICAL' ? 'text-rose-400' : (selectedSensor.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400')
                }`}>
                  Operating Status: {selectedSensor.status}
                </span>
              </div>

              {/* 20-point Time-Series History Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Telemetry History (Past 1 Hour)</span>
                  <span className="text-slate-500 font-mono">3-min cadence</span>
                </div>

                <div className="h-44 bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-end gap-1 overflow-x-auto">
                  {readingsHistory.map((r, i) => {
                    const min = selectedSensor.min_threshold || 0;
                    const max = selectedSensor.max_threshold || (selectedSensor.current_value * 1.5);
                    const range = Math.max(1, max - min);
                    const heightPct = Math.round(Math.min(100, Math.max(15, ((r.value - min) / range) * 100)));

                    return (
                      <div key={i} className="flex-1 min-w-[12px] flex flex-col items-center gap-1 group relative">
                        <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-slate-900 text-slate-100 text-[10px] p-1.5 rounded border border-slate-700 whitespace-nowrap z-20 pointer-events-none">
                          <span>{r.timestamp}</span>
                          <span className="font-bold">{r.value} {r.unit}</span>
                        </div>
                        <div
                          className={`w-full rounded-t transition-all ${
                            r.status === 'WARNING' ? 'bg-amber-400' : 'bg-cyan-500/70 hover:bg-cyan-400'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Threshold specifications */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Minimum Trip Threshold:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedSensor.min_threshold ? `${selectedSensor.min_threshold} ${selectedSensor.unit}` : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Maximum Alarm Threshold:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedSensor.max_threshold ? `${selectedSensor.max_threshold} ${selectedSensor.unit}` : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sampling Mode:</span>
                  <span className="font-mono text-emerald-400 font-bold">Simulated Continuous (5s)</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">Select a sensor to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
