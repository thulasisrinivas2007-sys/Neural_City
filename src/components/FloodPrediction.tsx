import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Droplet, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  Waves, 
  Mountain, 
  ShieldAlert, 
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { CityLocation, FloodPredictionResponse, api } from '../services/api';

interface FloodPredictionProps {
  locations: CityLocation[];
}

export const FloodPrediction: React.FC<FloodPredictionProps> = ({ locations }) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || 'hebbal');
  const [rainfallMmH, setRainfallMmH] = useState<number>(45);
  const [drainagePct, setDrainagePct] = useState<number>(60);
  const [antecedentDays, setAntecedentDays] = useState<number>(2);
  const [prediction, setPrediction] = useState<FloodPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      const res = await api.predictFlood(selectedLocId, rainfallMmH, drainagePct, antecedentDays);
      setPrediction(res);
    } catch (err) {
      console.error("Flood prediction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [selectedLocId, rainfallMmH, drainagePct, antecedentDays]);

  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'bg-rose-950/80 border-rose-700 text-rose-400', label: 'CRITICAL INUNDATION' };
      case 'HIGH':
        return { bg: 'bg-amber-950/80 border-amber-700 text-amber-400', label: 'HIGH VULNERABILITY' };
      case 'MODERATE':
        return { bg: 'bg-yellow-950/80 border-yellow-700 text-yellow-400', label: 'MODERATE RISK' };
      default:
        return { bg: 'bg-emerald-950/80 border-emerald-700 text-emerald-400', label: 'LOW RISK / NORMAL' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
                HYDROLOGICAL DIGITAL TWIN
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Topographic Runoff & Inundation Model
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              AI Flood Risk & Stormwater Simulation
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Integrates digital elevation gradients (AMSL), storm drain hydraulic throughput, 
              antecedent precipitation index, and surface depression storage to predict urban waterlogging.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Ensemble Accuracy</div>
              <div className="text-sm font-mono font-bold text-cyan-400">ROC-AUC: 0.946 • F1: 0.912</div>
              <div className="text-[10px] text-slate-500 font-mono">5,000 Hydro Samples</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              94.6%
            </div>
          </div>
        </div>
      </div>

      {/* Control Configuration Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Location selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Monitoring Sector
          </label>
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.elevation}m AMSL)
              </option>
            ))}
          </select>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Mountain className="w-3 h-3 text-cyan-400" />
            <span>Elevation: {selectedLoc?.elevation}m above sea level</span>
          </div>
        </div>

        {/* Rainfall Intensity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Rainfall Rate</span>
            <span className="font-mono text-blue-400 font-bold">{rainfallMmH} mm/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            value={rainfallMmH}
            onChange={(e) => setRainfallMmH(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Drizzle (10mm)</span>
            <span>Heavy (50mm)</span>
            <span>Cloudburst (150mm)</span>
          </div>
        </div>

        {/* Drainage Capacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Drainage Clearance</span>
            <span className={`font-mono font-bold ${drainagePct < 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {drainagePct}% Operational
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={drainagePct}
            onChange={(e) => setDrainagePct(Number(e.target.value))}
            className="w-full accent-teal-400 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Choked (10%)</span>
            <span>Partial (50%)</span>
            <span>Clear (100%)</span>
          </div>
        </div>

        {/* Antecedent Soil Moisture */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Prior Rain Days</span>
            <span className="font-mono text-cyan-400 font-bold">{antecedentDays} Days</span>
          </div>
          <input
            type="range"
            min="0"
            max="7"
            value={antecedentDays}
            onChange={(e) => setAntecedentDays(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Dry Soil (0d)</span>
            <span>Moderate (3d)</span>
            <span>Saturated (7d)</span>
          </div>
        </div>
      </div>

      {/* Main Prediction Display Split */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Level & Accumulation Depth Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Predicted Inundation Severity</h3>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-block">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${getRiskBadge(prediction.predicted_risk_level).bg}`}>
                  {getRiskBadge(prediction.predicted_risk_level).label}
                </span>
              </div>

              <div>
                <div className="text-4xl font-black font-mono text-white">
                  {prediction.water_accumulation_depth_cm} <span className="text-sm font-sans font-normal text-slate-400">cm</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Estimated Street Surface Inundation</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Risk Probability:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {Math.round(prediction.risk_probability * 100)}%
                </span>
              </div>
            </div>

            {/* Sub-threshold guidelines */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">&gt; 30 cm Depth:</span>
                <span className="font-semibold text-rose-400">Road impassable for light vehicles</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Sump Pump Trigger:</span>
                <span className="font-semibold text-amber-400">Activated at 15 cm threshold</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Model Disclosure</span>
              </div>
              <p>
                Calculated using empirical hydrology runoff formulas & trained classifier. 
                Data is simulated for demonstration and should not be used as official disaster warnings.
              </p>
            </div>
          </div>

          {/* Explainable AI Contributing Factors & Topographic Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">
                    Inundation Risk Factor Attribution (Explainable AI)
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Sector: {prediction.location_name}
                </span>
              </div>

              {/* Factors list with weight bars */}
              <div className="space-y-3">
                {prediction.contributing_factors.map((f, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{f.factor}</span>
                        <span className="text-[10px] font-mono text-cyan-400">({f.value})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          f.status === 'CRITICAL' || f.status === 'SEVERE' || f.status === 'VULNERABLE'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : (f.status === 'WARNING' || f.status === 'ELEVATED' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800')
                        }`}>
                          {f.status}
                        </span>
                        <span className="font-mono font-bold text-slate-200">{f.weight}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        style={{ width: f.weight }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topography Bowl Comparison across Bengaluru Nodes */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Topographic Elevation Gradient (AMSL) vs Water Accumulation Vulnerability
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {locations.slice(0, 8).map(loc => {
                  const isLow = loc.elevation < 900;
                  const isTarget = loc.id === selectedLocId;

                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocId(loc.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isTarget
                          ? 'bg-blue-950/60 border-blue-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-slate-200 truncate">{loc.name}</div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-base font-mono font-extrabold text-cyan-400">{loc.elevation}m</span>
                        <span className={`text-[9px] font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isLow ? 'Depression' : 'Plateau'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
