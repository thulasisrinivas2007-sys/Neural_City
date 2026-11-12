import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  TrendingUp, 
  CloudRain, 
  Droplet, 
  Zap, 
  Navigation, 
  Download, 
  Eye, 
  Info,
  Maximize2
} from 'lucide-react';
import { CityLocation, CityRoad, InfrastructureSensor, EmergencyRouteResponse } from '../services/api';

interface GisMapProps {
  locations: CityLocation[];
  roads: CityRoad[];
  sensors: InfrastructureSensor[];
  activeRoute: EmergencyRouteResponse | null;
  onSelectLocation?: (loc: CityLocation) => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  locations,
  roads,
  sensors,
  activeRoute,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    markers: L.LayerGroup;
    roads: L.LayerGroup;
    route: L.LayerGroup;
  }>({
    markers: L.layerGroup(),
    roads: L.layerGroup(),
    route: L.layerGroup(),
  });

  const [activeLayerFilter, setActiveLayerFilter] = useState<'ALL' | 'TRAFFIC' | 'FLOOD' | 'INFRASTRUCTURE'>('ALL');
  const [selectedNode, setSelectedNode] = useState<CityLocation | null>(null);
  const [showGeoJsonModal, setShowGeoJsonModal] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bengaluru city
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: false,
    });

    // Dark Theme OpenStreetMap tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layersRef.current.roads.addTo(map);
    layersRef.current.route.addTo(map);
    layersRef.current.markers.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Roads layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const roadGroup = layersRef.current.roads;
    roadGroup.clearLayers();

    const locMap = new Map(locations.map(l => [l.id, l]));

    roads.forEach(road => {
      const src = locMap.get(road.source_location_id);
      const dst = locMap.get(road.target_location_id);
      if (!src || !dst) return;

      const latlngs: [number, number][] = [
        [src.latitude, src.longitude],
        [dst.latitude, dst.longitude],
      ];

      let color = '#10b981'; // Green normal
      let dashArray: string | undefined = undefined;
      let weight = 4;

      if (road.is_closed) {
        color = '#f43f5e'; // Red
        dashArray = '6, 6';
        weight = 5;
      } else if (road.current_congestion > 0.75) {
        color = '#ef4444'; // Heavy congestion
        weight = 5;
      } else if (road.current_congestion > 0.45) {
        color = '#f59e0b'; // Moderate
        weight = 4;
      }

      // Hide roads in flood-only filter mode
      if (activeLayerFilter === 'FLOOD') {
        weight = 2;
        color = '#334155';
      }

      const polyline = L.polyline(latlngs, {
        color,
        weight,
        dashArray,
        opacity: 0.85,
      });

      polyline.bindPopup(`
        <div style="font-size: 12px; line-height: 1.4; color: #f8fafc;">
          <b style="color: #38bdf8;">${road.name}</b><br/>
          <span>Distance: ${road.distance_km} km • ${road.lanes} Lanes</span><br/>
          <span>Congestion: <b>${Math.round(road.current_congestion * 100)}%</b></span><br/>
          <span>Status: <b style="color: ${road.is_closed ? '#f43f5e' : (road.current_congestion > 0.75 ? '#ef4444' : '#10b981')}">${road.is_closed ? 'CLOSED' : 'ACTIVE'}</b></span>
        </div>
      `);

      roadGroup.addLayer(polyline);
    });
  }, [locations, roads, activeLayerFilter]);

  // Update Active Emergency Route polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const routeGroup = layersRef.current.route;
    routeGroup.clearLayers();

    if (activeRoute && activeRoute.route_polyline && activeRoute.route_polyline.length > 1) {
      const latlngs: [number, number][] = activeRoute.route_polyline.map(p => [p[0], p[1]]);
      
      // Glowing background line
      const glowLine = L.polyline(latlngs, {
        color: '#06b6d4',
        weight: 10,
        opacity: 0.4,
      });

      // Sharp animated active route
      const mainLine = L.polyline(latlngs, {
        color: '#38bdf8',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
      });

      routeGroup.addLayer(glowLine);
      routeGroup.addLayer(mainLine);
    }
  }, [activeRoute]);

  // Update Markers layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const markerGroup = layersRef.current.markers;
    markerGroup.clearLayers();

    locations.forEach(loc => {
      let markerColor = '#10b981'; // Emerald
      let pulseColor = '#10b981';

      if (loc.current_flood_risk === 'CRITICAL' || loc.current_congestion > 0.8) {
        markerColor = '#f43f5e'; // Rose
        pulseColor = '#f43f5e';
      } else if (loc.current_flood_risk === 'HIGH' || loc.current_congestion > 0.55) {
        markerColor = '#f59e0b'; // Amber
        pulseColor = '#f59e0b';
      }

      // Filter modes
      if (activeLayerFilter === 'FLOOD') {
        if (loc.elevation < 900) {
          markerColor = '#3b82f6';
          pulseColor = '#3b82f6';
        } else {
          markerColor = '#64748b';
        }
      }

      // Custom SVG DivIcon with radar ping
      const customIcon = L.divIcon({
        className: 'custom-city-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${pulseColor}; opacity: 0.3; animation: radar-ping 2s infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${markerColor}; border: 2.5px solid #020617; box-shadow: 0 0 10px ${markerColor};"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedNode(loc);
        if (onSelectLocation) onSelectLocation(loc);
      });

      marker.bindTooltip(`
        <div style="font-weight: 700; font-size: 11px; color: #f8fafc; background: #0f172a; padding: 2px 6px; border-radius: 4px; border: 1px solid #334155;">
          ${loc.name}
        </div>
      `, { permanent: false, direction: 'top', offset: [0, -10] });

      markerGroup.addLayer(marker);
    });
  }, [locations, activeLayerFilter, onSelectLocation]);

  // Generate GeoJSON representation
  const generateGeoJson = () => {
    return {
      type: "FeatureCollection",
      features: [
        ...locations.map(loc => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [loc.longitude, loc.latitude] },
          properties: {
            id: loc.id,
            name: loc.name,
            elevation: loc.elevation,
            congestion: loc.current_congestion,
            flood_risk: loc.current_flood_risk,
          }
        })),
        ...roads.map(road => {
          const src = locations.find(l => l.id === road.source_location_id);
          const dst = locations.find(l => l.id === road.target_location_id);
          return {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: src && dst ? [[src.longitude, src.latitude], [dst.longitude, dst.latitude]] : []
            },
            properties: {
              id: road.id,
              name: road.name,
              distance_km: road.distance_km,
              is_closed: road.is_closed,
              congestion: road.current_congestion,
            }
          };
        })
      ]
    };
  };

  const handleDownloadGeoJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generateGeoJson(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "neural_city_bengaluru_gis.geojson");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-2 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIS Layers:</span>
          </span>

          <button
            onClick={() => setActiveLayerFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayerFilter === 'ALL'
                ? 'bg-cyan-500 text-black shadow-sm font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            All Corridors & Nodes
          </button>

          <button
            onClick={() => setActiveLayerFilter('TRAFFIC')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayerFilter === 'TRAFFIC'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Traffic Flow
          </button>

          <button
            onClick={() => setActiveLayerFilter('FLOOD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayerFilter === 'FLOOD'
                ? 'bg-blue-500 text-white shadow-sm font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Flood Vulnerability
          </button>

          <button
            onClick={() => setActiveLayerFilter('INFRASTRUCTURE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayerFilter === 'INFRASTRUCTURE'
                ? 'bg-purple-500 text-white shadow-sm font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Grid & Reservoirs
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowGeoJsonModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>GeoJSON</span>
          </button>

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([12.9716, 77.5946], 12);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="Reset to Bengaluru Center"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Center</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Map & Node Detail Drawer Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[620px]">
        {/* Leaflet map container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl space-y-2 pointer-events-auto max-w-[210px]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            GIS Digital Twin Legend
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span>Normal (&lt; 50% load)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              <span>Elevated / Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-ping" />
              <span>Critical / Inundation</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <span className="w-4 h-0.5 bg-rose-500 border border-dashed border-rose-300" />
              <span>Closed Corridor</span>
            </div>
            {activeRoute && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-cyan-400 rounded-full" />
                <span className="text-cyan-300 font-bold">Active Route</span>
              </div>
            )}
          </div>
          <div className="text-[9px] text-slate-500 pt-1">
            *Illustrative demonstration model coordinates
          </div>
        </div>

        {/* Node Detail Drawer / Inspection Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {selectedNode.category.toUpperCase()}
                </span>
                <h3 className="font-extrabold text-white text-base mt-1.5">{selectedNode.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedNode.latitude.toFixed(4)}° N, {selectedNode.longitude.toFixed(4)}° E
                </p>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">Elevation (AMSL)</span>
                <span className="font-mono font-bold text-slate-200 text-sm">{selectedNode.elevation}m</span>
                <span className="text-[9px] text-slate-500 block">
                  {selectedNode.elevation < 900 ? 'Low-lying basin' : 'Elevated plateau'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">Congestion</span>
                <span className={`font-mono font-bold text-sm ${
                  selectedNode.current_congestion > 0.7 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {Math.round(selectedNode.current_congestion * 100)}%
                </span>
                <span className="text-[9px] text-slate-500 block">Live corridor link</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">Flood Risk</span>
                <span className={`font-mono font-bold text-sm ${
                  selectedNode.current_flood_risk === 'CRITICAL' ? 'text-rose-400' : (selectedNode.current_flood_risk === 'HIGH' ? 'text-amber-400' : 'text-emerald-400')
                }`}>
                  {selectedNode.current_flood_risk}
                </span>
                <span className="text-[9px] text-slate-500 block">Hydraulic runoff</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">Population</span>
                <span className="font-mono font-bold text-slate-200 text-sm">
                  {selectedNode.population_density.toLocaleString()} /km²
                </span>
                <span className="text-[9px] text-slate-500 block">Ward #{selectedNode.ward_number}</span>
              </div>
            </div>

            {/* Related Sensors at this node */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-300">Active IoT Telemetry</span>
              {sensors.filter(s => s.location_id === selectedNode.id).length === 0 ? (
                <p className="text-[10px] text-slate-500">Connected through regional junction telemetry.</p>
              ) : (
                sensors.filter(s => s.location_id === selectedNode.id).map(sensor => (
                  <div key={sensor.id} className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 text-[11px] truncate max-w-[160px]">{sensor.name}</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {sensor.current_value} {sensor.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* GeoJSON inspection modal */}
      {showGeoJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-lg">GeoJSON Topology Export</h3>
                <p className="text-xs text-slate-400">Standard RFC 7946 GeoJSON format of Bengaluru demonstration nodes and road links.</p>
              </div>
              <button 
                onClick={() => setShowGeoJsonModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 select-all">
              <pre>{JSON.stringify(generateGeoJson(), null, 2)}</pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowGeoJsonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleDownloadGeoJson}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download .geojson</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
