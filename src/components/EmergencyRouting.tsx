import React, { useState, useEffect } from 'react';
import { 
  Ambulance, 
  Flame, 
  Shield, 
  MapPin, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Ban, 
  ArrowRight,
  Info
} from 'lucide-react';
import { CityLocation, CityRoad, EmergencyRouteResponse, api } from '../services/api';

interface EmergencyRoutingProps {
  locations: CityLocation[];
  roads: CityRoad[];
  onRouteCalculated: (route: EmergencyRouteResponse | null) => void;
  onRoadClosureToggled: () => void;
  setActiveModule: (m: string) => void;
}

export const EmergencyRouting: React.FC<EmergencyRoutingProps> = ({
  locations,
  roads,
  onRouteCalculated,
  onRoadClosureToggled,
  setActiveModule,
}) => {
  const [sourceId, setSourceId] = useState<string>('majestic');
  const [destinationId, setDestinationId] = useState<string>('whitefield');
  const [serviceType, setServiceType] = useState<string>('AMBULANCE');
  const [avoidClosed, setAvoidClosed] = useState<boolean>(true);
  const [considerCongestion, setConsiderCongestion] = useState<boolean>(true);
  const [considerFlood, setConsiderFlood] = useState<boolean>(true);
  
  const [routeResult, setRouteResult] = useState<EmergencyRouteResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [togglingRoadId, setTogglingRoadId] = useState<string | null>(null);

  const calculateRoute = async () => {
    setIsCalculating(true);
    try {
      const res = await api.calculateEmergencyRoute({
        source_id: sourceId,
        destination_id: destinationId,
        service_type: serviceType,
        avoid_closed_roads: avoidClosed,
        consider_traffic_congestion: considerCongestion,
        consider_flood_risk: considerFlood,
      });
      setRouteResult(res);
      onRouteCalculated(res);
    } catch (err) {
      console.error("Routing error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculateRoute();
  }, [sourceId, destinationId, serviceType, avoidClosed, considerCongestion, considerFlood]);

  const handleToggleRoad = async (road: CityRoad) => {
    setTogglingRoadId(road.id);
    try {
      await api.toggleRoadClosure(road.id, !road.is_closed, "Manual Incident Barrier");
      onRoadClosureToggled();
      // Recalculate route after closure change
      await calculateRoute();
    } catch (e) {
      console.error("Error toggling road:", e);
    } finally {
      setTogglingRoadId(null);
    }
  };

  const services = [
    { id: 'AMBULANCE', label: 'Emergency Ambulance', icon: Ambulance, color: 'text-rose-400', desc: 'Critical siren priority (-25% congestion drag)' },
    { id: 'FIRE_BRIGADE', label: 'Heavy Fire Tender', icon: Flame, color: 'text-amber-400', desc: 'Hydraulic ladder vehicle requiring high-clearance roads' },
    { id: 'RESCUE_SQUAD', label: 'Disaster Relief Squad', icon: Shield, color: 'text-cyan-400', desc: 'Amphibious flood rescue convoy' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
                GRAPH OPTIMIZATION ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Dijkstra Dynamic Shortest-Path Algorithm
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Emergency Vehicle Route Optimization & Dynamic Dispatch
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Calculates lowest-impedance emergency trajectories factoring in real-time corridor congestion, 
              flash flood ponding hazards, and manual police barricade closures.
            </p>
          </div>

          <button
            onClick={() => setActiveModule('map')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
          >
            <Navigation className="w-4 h-4" />
            <span>View Active Path on GIS Map</span>
          </button>
        </div>
      </div>

      {/* Dispatch Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Service Type Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Emergency Service Unit
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {services.map((s) => {
              const Icon = s.icon;
              const isSelected = serviceType === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setServiceType(s.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-950 border-rose-500 shadow-md shadow-rose-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200">{s.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dispatch Origin (Base Station / Hospital)</span>
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Incident Destination</span>
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optimization Options checkboxes */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={avoidClosed}
              onChange={(e) => setAvoidClosed(e.target.checked)}
              className="rounded accent-cyan-400 bg-slate-950"
            />
            <span>Avoid Barricaded / Closed Roads</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={considerCongestion}
              onChange={(e) => setConsiderCongestion(e.target.checked)}
              className="rounded accent-cyan-400 bg-slate-950"
            />
            <span>Weigh Real-Time Traffic Impedance</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={considerFlood}
              onChange={(e) => setConsiderFlood(e.target.checked)}
              className="rounded accent-cyan-400 bg-slate-950"
            />
            <span>Bypass Low-Elevation Flood Ponding Zones</span>
          </label>
        </div>
      </div>

      {/* Main Results Split: Route Summary & Road Closures Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Solution Card (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {routeResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>Computed Route Trajectory</span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800">
                  OPTIMAL PATH FOUND
                </span>
              </div>

              {/* Summary Metrics Banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Distance</span>
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    {routeResult.total_distance_km} <span className="text-xs font-sans font-normal text-slate-400">km</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estimated Time</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {routeResult.estimated_time_mins} <span className="text-xs font-sans font-normal text-slate-400">mins</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Congestion Delay</span>
                  <span className="text-2xl font-black font-mono text-amber-400">
                    +{routeResult.congestion_delay_mins} <span className="text-xs font-sans font-normal text-slate-400">mins</span>
                  </span>
                </div>
              </div>

              {/* Waypoints path breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Transit Nodes Path ({routeResult.path_nodes.length} Waypoints)
                </span>
                <div className="flex items-center flex-wrap gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  {routeResult.path_nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        i === 0 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : (i === routeResult.path_nodes.length - 1 ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-200 border border-slate-700')
                      }`}>
                        {node.name}
                      </span>
                      {i < routeResult.path_nodes.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Avoided Hazards List */}
              {routeResult.avoided_hazards.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Avoided Hazard Intersections:</span>
                  </span>
                  <ul className="list-disc list-inside text-amber-200/90 text-[11px] space-y-0.5">
                    {routeResult.avoided_hazards.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Road Closures Manager (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              <h3 className="font-bold text-white text-sm">Road Closure Control</h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Toggle simulated closures to test instant dynamic rerouting.
            </p>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {roads.map((road) => (
              <div
                key={road.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 truncate">{road.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {road.distance_km} km • {Math.round(road.current_congestion * 100)}% load
                  </div>
                </div>

                <button
                  onClick={() => handleToggleRoad(road)}
                  disabled={togglingRoadId === road.id}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${
                    road.is_closed
                      ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {road.is_closed ? 'CLOSED (Open)' : 'ACTIVE (Close)'}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-500">
            *Demonstration road network topology for Bengaluru Metropolitan area.
          </div>
        </div>
      </div>
    </div>
  );
};
