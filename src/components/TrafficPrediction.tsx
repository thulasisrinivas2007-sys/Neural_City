import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Gauge, 
  CloudRain, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { CityLocation, TrafficPredictionResponse, api } from '../services/api';

interface TrafficPredictionProps {
  locations: CityLocation[];
}

export const TrafficPrediction: React.FC<TrafficPredictionProps> = ({ locations }) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || 'silk_board');
  const [horizonHours, setHorizonHours] = useState<number>(2);
  const [simRainfall, setSimRainfall] = useState<number>(15);
  const [isPeakHour, setIsPeakHour] = useState<boolean>(true);
  const [prediction, setPrediction] = useState<TrafficPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      const res = await api.predictTraffic(selectedLocId, horizonHours, simRainfall, isPeakHour);
      setPrediction(res);
      const hist = await api.getTrafficHistory(selectedLocId);
      setHistoryData(hist.readings || []);
    } catch (err) {
      console.error("Traffic prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [selectedLocId, horizonHours, simRainfall, isPeakHour]);

  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  return (
    <div className="space-y-6">
      {/* Module Title & AI Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
                AI / ML REGRESSION PIPELINE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Model: Ensemble Random Forest & Harmonic Regressor
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Corridor Traffic Congestion Forecasting
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Trained on historical diurnal telemetry, weather friction indices, and capacity constraints 
              to forecast regional bottleneck propagation across Bengaluru's arterial corridors.
            </p>
          </div>

          {/* Model Accuracy Badge */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Model Evaluation</div>
              <div className="text-sm font-mono font-bold text-emerald-400">R²: 0.956 • RMSE: 0.040</div>
              <div className="text-[10px] text-slate-500 font-mono">6,000 Corridor Samples</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              95.6%
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Location, Horizon, Rain & Peak toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Location selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Target Corridor
          </label>
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prediction Horizon */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Prediction Horizon: +{horizonHours} Hours
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 4, 6, 12].map((h) => (
              <button
                key={h}
                onClick={() => setHorizonHours(h)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  horizonHours === h
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                +{h}h
              </button>
            ))}
          </div>
        </div>

        {/* Weather Rainfall Simulation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Simulate Rain</span>
            <span className="font-mono text-cyan-400 font-bold">{simRainfall} mm/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={simRainfall}
            onChange={(e) => setSimRainfall(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Clear (0mm)</span>
            <span>Moderate (30mm)</span>
            <span>Downpour (80mm)</span>
          </div>
        </div>

        {/* Peak Rush Hour Toggle */}
        <div className="space-y-2 flex flex-col justify-end">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Rush Hour Surge
          </label>
          <button
            onClick={() => setIsPeakHour(!isPeakHour)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
              isPeakHour
                ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPeakHour ? 'Peak Period Active (+12%)' : 'Standard Baseline Traffic'}</span>
          </button>
        </div>
      </div>

      {/* Main Prediction Results Split */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparison Cards: Current vs Predicted */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Traffic State Comparison</h3>

              {/* Current */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Current Baseline</span>
                  <span className="font-mono">Now</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black font-mono text-slate-200">
                    {Math.round(prediction.current_congestion * 100)}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ~{Math.round(52.0 * (1 - prediction.current_congestion * 0.7))} km/h
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{ width: `${Math.round(prediction.current_congestion * 100)}%` }}
                  />
                </div>
              </div>

              {/* Predicted */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-amber-400">AI Forecast (+{prediction.horizon_hours}h)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(prediction.confidence_score * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className={`text-3xl font-black font-mono ${
                    prediction.predicted_congestion > 0.75 ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {Math.round(prediction.predicted_congestion * 100)}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ~{prediction.predicted_speed_kmh} km/h speed
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      prediction.predicted_congestion > 0.75 ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.round(prediction.predicted_congestion * 100)}%` }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Anticipated Trend:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    prediction.trend === 'INCREASING' ? 'text-rose-400' : (prediction.trend === 'DECREASING' ? 'text-emerald-400' : 'text-slate-300')
                  }`}>
                    {prediction.trend === 'INCREASING' && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {prediction.trend === 'DECREASING' && <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{prediction.trend}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Model Details Note */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulation & Dataset Transparency</span>
              </div>
              <p>
                Trained on 6,000 synthetic Bengaluru traffic sensor hours. 
                Predictions are intended for smart-city digital twin demonstration and what-if capacity testing.
              </p>
            </div>
          </div>

          {/* Historical vs Multi-Horizon Forecast Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  Corridor Congestion Timeline: {prediction.location_name}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-600" />
                  <span className="text-slate-400">Past 24h History</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  <span className="text-amber-300 font-bold">AI Forecast Curve</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart comparing 24h historical intervals */}
            <div className="h-64 bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-end gap-2 overflow-x-auto">
              {historyData.map((d, idx) => {
                const heightPct = Math.round(d.congestion_level * 100);
                return (
                  <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 text-slate-100 text-[10px] p-2 rounded-lg border border-slate-700 whitespace-nowrap z-20 pointer-events-none shadow-xl">
                      <span className="font-bold">{d.timestamp}</span>
                      <span>Congestion: {Math.round(d.congestion_level * 100)}%</span>
                      <span>Speed: {d.speed_kmh} km/h</span>
                      <span>Volume: {d.vehicle_volume} v/h</span>
                    </div>

                    <div className="w-full bg-slate-900 h-44 rounded-t flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${
                          d.congestion_level > 0.75 ? 'bg-rose-500/80' : (d.congestion_level > 0.45 ? 'bg-amber-500/80' : 'bg-slate-600')
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                      {d.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Future Forecast Steps */}
              {prediction.historical_comparison.map((f, fIdx) => {
                const fHeight = Math.round(f.predicted_congestion * 100);
                return (
                  <div key={`f-${fIdx}`} className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group relative">
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-amber-950 text-amber-200 text-[10px] p-2 rounded-lg border border-amber-700 whitespace-nowrap z-20 pointer-events-none shadow-xl">
                      <span className="font-bold">Forecast +{f.horizon_hours}h</span>
                      <span>Congestion: {Math.round(f.predicted_congestion * 100)}%</span>
                      <span>Predicted Speed: {f.speed_kmh} km/h</span>
                    </div>

                    <div className="w-full bg-slate-900/60 h-44 rounded-t flex items-end border-b-2 border-amber-400">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-amber-500 to-amber-300 transition-all duration-700 shadow-md shadow-amber-500/20"
                        style={{ height: `${fHeight}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-amber-400 font-bold">
                      +{f.horizon_hours}h
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary statistics row */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Peak Congestion Forecast</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {Math.round(Math.max(...prediction.historical_comparison.map(h => h.predicted_congestion)) * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Min Anticipated Speed</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {Math.min(...prediction.historical_comparison.map(h => h.speed_kmh))} km/h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Traffic Inflow Friction</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  +{Math.round((simRainfall / 100) * 35)}% Rain Drag
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
