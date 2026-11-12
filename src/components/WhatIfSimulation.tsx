import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  CloudRain, 
  TrendingUp, 
  Droplet, 
  Zap, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Users,
  ShieldAlert,
  History
} from 'lucide-react';
import { CityLocation, CityRoad, SimulationResult, api } from '../services/api';

interface WhatIfSimulationProps {
  locations: CityLocation[];
  roads: CityRoad[];
  onSimulationCompleted: (res: SimulationResult) => void;
  setActiveModule: (m: string) => void;
}

export const WhatIfSimulation: React.FC<WhatIfSimulationProps> = ({
  locations,
  roads,
  onSimulationCompleted,
  setActiveModule,
}) => {
  const [rainfallMm, setRainfallMm] = useState<number>(75);
  const [drainagePct, setDrainagePct] = useState<number>(40);
  const [trafficSurge, setTrafficSurge] = useState<number>(1.5);
  const [waterDemand, setWaterDemand] = useState<number>(1.2);
  const [powerDemand, setPowerDemand] = useState<number>(1.3);
  const [selectedClosures, setSelectedClosures] = useState<string[]>(['road-hebbal-majestic']);
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const presets = [
    {
      name: "Monsoon Cloudburst & Drain Choke",
      rain: 95,
      drainage: 30,
      traffic: 1.6,
      closures: ['road-hebbal-majestic', 'road-koramangala-silk_board'],
      power: 1.4,
      water: 1.3,
    },
    {
      name: "Rush Hour + Water Main Burst",
      rain: 25,
      drainage: 60,
      traffic: 2.1,
      closures: ['road-majestic-kr_market'],
      power: 1.2,
      water: 1.6,
    },
    {
      name: "Mild Summer Storm (Controlled)",
      rain: 35,
      drainage: 80,
      traffic: 1.1,
      closures: [],
      power: 1.1,
      water: 1.0,
    }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setRainfallMm(p.rain);
    setDrainagePct(p.drainage);
    setTrafficSurge(p.traffic);
    setSelectedClosures(p.closures);
    setPowerDemand(p.power);
    setWaterDemand(p.water);
  };

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      const res = await api.runSimulation({
        scenario_name: "Connected Urban Cascade Scenario",
        rainfall_intensity_mm: rainfallMm,
        drainage_capacity_pct: drainagePct,
        traffic_surge_factor: trafficSurge,
        water_demand_factor: waterDemand,
        electricity_demand_factor: powerDemand,
        simulated_road_closures: selectedClosures,
      });
      setSimResult(res);
      onSimulationCompleted(res);
    } catch (e) {
      console.error("Simulation run error:", e);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleClosure = (roadId: string) => {
    if (selectedClosures.includes(roadId)) {
      setSelectedClosures(selectedClosures.filter(id => id !== roadId));
    } else {
      setSelectedClosures([...selectedClosures, roadId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                MULTI-SYSTEM DIGITAL TWIN
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cross-Domain Cascading Failure Engine
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Connected "What-If" Scenario Simulation
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Model interdependent urban feedback loops: Torrential Rain → Low-Point Inundation → 
              Road Submergence → Traffic Gridlock Spillover → Electrical Substation Trip Safeguards.
            </p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 shrink-0"
          >
            <Play className={`w-4 h-4 fill-black ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Processing Cascade...' : 'Execute Scenario Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Presets Quick Select */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Scenarios:
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(p)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 shrink-0 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Variable Sliders Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Rainfall */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span>Rainfall Intensity</span>
            </span>
            <span className="font-mono text-blue-400 font-bold">{rainfallMm} mm/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={rainfallMm}
            onChange={(e) => setRainfallMm(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Dry (0)</span>
            <span>Heavy (60)</span>
            <span>Extreme (180)</span>
          </div>
        </div>

        {/* 2. Drainage Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-teal-400" />
              <span>Drainage Clearance</span>
            </span>
            <span className="font-mono text-teal-400 font-bold">{drainagePct}%</span>
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
            <span>Severe Clog (10%)</span>
            <span>Nominal (70%)</span>
            <span>Pristine (100%)</span>
          </div>
        </div>

        {/* 3. Traffic Surge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Traffic Volume Multiplier</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{trafficSurge.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={trafficSurge}
            onChange={(e) => setTrafficSurge(Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Night Off-Peak (0.5x)</span>
            <span>Standard (1.0x)</span>
            <span>Gridlock Surge (2.5x)</span>
          </div>
        </div>

        {/* 4. Electricity Demand */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Power Grid Load</span>
            </span>
            <span className="font-mono text-yellow-400 font-bold">{powerDemand.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2.0"
            step="0.1"
            value={powerDemand}
            onChange={(e) => setPowerDemand(Number(e.target.value))}
            className="w-full accent-yellow-400 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Low (0.6x)</span>
            <span>Standard (1.0x)</span>
            <span>Peak Heatwave (2.0x)</span>
          </div>
        </div>

        {/* 5. Water Demand */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span>Water Consumption Stress</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{waterDemand.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={waterDemand}
            onChange={(e) => setWaterDemand(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Subdued (0.5x)</span>
            <span>Standard (1.0x)</span>
            <span>High Stress (2.0x)</span>
          </div>
        </div>

        {/* 6. Road Closures quick pick */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Simulated Blockades</span>
            <span className="font-mono text-rose-400 font-bold">{selectedClosures.length} Corridors</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roads.slice(0, 4).map((r) => {
              const isClosed = selectedClosures.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleClosure(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                    isClosed
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {r.name.split(' ')[0]} ({isClosed ? 'Blocked' : 'Open'})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulation Results Section */}
      {simResult && (
        <div className="space-y-6">
          {/* Before & After Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Health Score Impact */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block font-semibold">City Health Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-rose-400">
                  {simResult.simulated_health_score}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  was {simResult.baseline_health_score} ({simResult.health_score_delta})
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${simResult.simulated_health_score}%` }}
                />
              </div>
            </div>

            {/* Inundated Sectors */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block font-semibold">Flooded Sectors</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-blue-400">
                  {simResult.affected_locations_count}
                </span>
                <span className="text-xs text-slate-400">Low-lying wards</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Pop. at risk: ~{simResult.at_risk_population.toLocaleString()} citizens
              </div>
            </div>

            {/* Choked Roads */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block font-semibold">Gridlocked Corridors</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-amber-400">
                  {simResult.traffic_impacts.filter(t => t.simulated_congestion > 0.7).length}
                </span>
                <span className="text-xs text-slate-400">of {roads.length} links</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Severe crawl speed (&lt; 10 km/h)
              </div>
            </div>

            {/* Emergency Path Rerouting */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block font-semibold">Ambulances Rerouted</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-cyan-400">
                  {simResult.rerouted_emergency_paths}
                </span>
                <span className="text-xs text-slate-400">Active bypasses</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Avg detour: +8.4 mins response delay
              </div>
            </div>
          </div>

          {/* Connected Cascade Chain Narrative */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-System Cascade Propagation Timeline</span>
            </h3>

            <div className="space-y-2.5">
              {simResult.cascade_chain.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Subsystems Impact Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flood Inundation Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Sector Inundation Telemetry
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {simResult.flood_impacts.map(f => (
                  <div key={f.location_id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{f.location_name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : (f.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400')
                      }`}>
                        {f.risk_level}
                      </span>
                      <span className="text-slate-400">{f.water_depth_cm} cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Substation & Grid Stress */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Grid & Water Network Strains
              </h4>
              <div className="space-y-2">
                {simResult.power_water_impacts.map((pw, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{pw.subsystem}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pw.status === 'CRITICAL' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {pw.simulated_value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{pw.risk_description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
