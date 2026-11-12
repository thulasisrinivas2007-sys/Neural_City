/**
 * NEURAL CITY – AI-Powered Urban Infrastructure Digital Twin
 * Main Application Component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CityOverview } from './components/CityOverview';
import { GisMap } from './components/GisMap';
import { TrafficPrediction } from './components/TrafficPrediction';
import { FloodPrediction } from './components/FloodPrediction';
import { InfrastructureMonitoring } from './components/InfrastructureMonitoring';
import { EmergencyRouting } from './components/EmergencyRouting';
import { WhatIfSimulation } from './components/WhatIfSimulation';
import { AlertsManager } from './components/AlertsManager';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { 
  api, 
  DashboardOverview, 
  CityLocation, 
  CityRoad, 
  InfrastructureSensor, 
  AlertItem, 
  EmergencyRouteResponse,
  SimulationResult,
  FALLBACK_OVERVIEW,
  FALLBACK_LOCATIONS,
  FALLBACK_ROADS,
  FALLBACK_SENSORS,
  FALLBACK_ALERTS
} from './services/api';

export default function App() {
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [overview, setOverview] = useState<DashboardOverview | null>(FALLBACK_OVERVIEW);
  const [locations, setLocations] = useState<CityLocation[]>(FALLBACK_LOCATIONS);
  const [roads, setRoads] = useState<CityRoad[]>(FALLBACK_ROADS);
  const [sensors, setSensors] = useState<InfrastructureSensor[]>(FALLBACK_SENSORS);
  const [alerts, setAlerts] = useState<AlertItem[]>(FALLBACK_ALERTS);
  const [activeRoute, setActiveRoute] = useState<EmergencyRouteResponse | null>(null);
  const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Load all telemetry from backend
  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const results = await Promise.allSettled([
        api.getOverview(),
        api.getLocations(),
        api.getRoads(),
        api.getSensors(),
        api.getAlerts(),
      ]);

      const [ovRes, locRes, roadRes, sensRes, altRes] = results;

      let anySuccess = false;
      if (ovRes.status === 'fulfilled') {
        setOverview(ovRes.value);
        anySuccess = true;
      }
      if (locRes.status === 'fulfilled') {
        setLocations(locRes.value);
        anySuccess = true;
      }
      if (roadRes.status === 'fulfilled') {
        setRoads(roadRes.value);
        anySuccess = true;
      }
      if (sensRes.status === 'fulfilled') {
        setSensors(sensRes.value);
        anySuccess = true;
      }
      if (altRes.status === 'fulfilled') {
        setAlerts(altRes.value);
        anySuccess = true;
      }

      setServerOnline(anySuccess);
      if (!anySuccess) {
        console.warn("Backend telemetry sync in progress, local fallback active.");
      }
    } catch (err) {
      console.warn("Telemetry fetch sync notice:", err);
      setServerOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic polling for live simulated telemetry
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 10000); // 10s polling

    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // Alert acknowledgment handler
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, 'Central Dispatch Officer');
      // Update local state
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_acknowledged: true } : a));
      // Refresh overview
      const ovRes = await api.getOverview();
      setOverview(ovRes);
    } catch (e) {
      console.error("Failed to acknowledge alert:", e);
    }
  };

  const handleSimulationCompleted = (res: SimulationResult) => {
    setLastSimulation(res);
    // If simulation affected road closures or health, refresh overview & roads
    loadData(true);
  };

  const unreadAlertsCount = alerts.filter(a => !a.is_acknowledged).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        overview={overview}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(false)}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          unreadAlertsCount={unreadAlertsCount}
          serverOnline={serverOnline}
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'overview' && (
              <CityOverview
                overview={overview}
                alerts={alerts}
                locations={locations}
                roads={roads}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                setActiveModule={setActiveModule}
                isLoading={isLoading}
              />
            )}

            {activeModule === 'map' && (
              <GisMap
                locations={locations}
                roads={roads}
                sensors={sensors}
                activeRoute={activeRoute}
                onSelectLocation={(loc) => {
                  console.log("Selected location:", loc.name);
                }}
              />
            )}

            {activeModule === 'traffic' && (
              <TrafficPrediction locations={locations} />
            )}

            {activeModule === 'flood' && (
              <FloodPrediction locations={locations} />
            )}

            {activeModule === 'infrastructure' && (
              <InfrastructureMonitoring
                sensors={sensors}
                onRefreshSensors={() => loadData(true)}
              />
            )}

            {activeModule === 'emergency' && (
              <EmergencyRouting
                locations={locations}
                roads={roads}
                onRouteCalculated={(route) => setActiveRoute(route)}
                onRoadClosureToggled={() => loadData(true)}
                setActiveModule={setActiveModule}
              />
            )}

            {activeModule === 'simulation' && (
              <WhatIfSimulation
                locations={locations}
                roads={roads}
                onSimulationCompleted={handleSimulationCompleted}
                setActiveModule={setActiveModule}
              />
            )}

            {activeModule === 'alerts' && (
              <AlertsManager
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onRefreshAlerts={() => loadData(true)}
              />
            )}

            {activeModule === 'architecture' && (
              <ArchitectureDocs />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
