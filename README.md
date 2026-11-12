# NEURAL CITY – AI-Powered Urban Infrastructure Digital Twin

**NEURAL CITY** is a full-stack, enterprise-grade Urban Infrastructure Digital Twin for the **Bengaluru Metropolitan Demonstration Area**. It combines real-time simulated SCADA/IoT sensor telemetry, AI-driven traffic bottleneck forecasting, hydrological flood inundation prediction, GIS geospatial vector mapping, multi-objective emergency routing (Dijkstra), and a connected multi-variable "What-If" cascade simulation engine.

---

## 1. Key Features

### 🏛️ Module 1 – City Overview Dashboard
- **City Health Score**: Dynamic composite infrastructure resilience index (0–100) combining traffic impedance, flood ponding, and sensor deviations.
- **Real-Time Telemetry Metrics**: Monitored urban hubs, average corridor congestion, flood vulnerability zones, municipal water distribution health, and 220kV power grid stability.
- **Incident Feed**: Central dispatch incident log with one-click operator acknowledgment.
- **Live Background Polling**: Configurable automatic 10-second polling cadence with manual refresh triggers.

### 🗺️ Module 2 – GIS Digital Twin Map
- **Geographic Area**: Bengaluru demonstration sector featuring **Hebbal, Yelahanka, Majestic (KBS), Indiranagar, Koramangala, Whitefield, KR Market, Silk Board, and MG Road**.
- **Interactive Leaflet Canvas**: Dark-matter CartoDB/OpenStreetMap tiles, vector road lines dynamically colored by congestion level and closure barriers.
- **Live Node Markers**: Animated SVG radar ping markers indicating health status (Emerald: Normal, Amber: Warning, Rose: Critical).
- **Layer Filtering**: Switch between All Infrastructure, Traffic Congestion Heat, Flood Vulnerability, and Grid Sensors.
- **RFC 7946 GeoJSON Export**: One-click download and live inspection of city topology GeoJSON.

### 🚗 Module 3 – AI Traffic Prediction Pipeline
- **Ensemble Regression Model**: Trained on diurnal harmonic patterns, weather rain friction coefficients, and peak rush-hour multipliers.
- **Multi-Step Horizon Forecasting**: Predicts corridor congestion percentages and speed (km/h) for **+1h, +2h, +4h, +6h, and +12h**.
- **Historical Comparison**: 24-hour historical baseline telemetry plotted against future prediction curves.
- **Evaluated Performance**: Model yields **R² = 0.956, RMSE = 0.040, MAE = 0.031** on 6,000 synthetic corridor sensor hours.

### 🌊 Module 4 – AI Flood Risk & Stormwater Hydrology
- **Hydrological Inundation Model**: Factors in digital elevation gradients (AMSL), storm drain capacity %, rainfall intensity (mm/h), and antecedent soil saturation.
- **Explainable AI (XAI)**: Feature contribution breakdown quantifying rainfall impact %, drainage deficit %, and topographic bowl depression %.
- **Topographic Elevation Comparison**: Bengaluru valley low-points (Hebbal 888m, Koramangala 882m) vs high plateaus (MG Road 920m).

### ⚡ Module 5 – Infrastructure SCADA/IoT Monitoring
- **Municipal Water Distribution**: Pipeline hydraulic pressure (bar), acoustic flowmeters (L/min), and reservoir sump levels (m) with micro-leakage alerts.
- **High-Voltage Power Grid**: 220kV transformer peak thermal oil sensors (°C), bus voltage (V), and distribution load percentages (%).
- **Interactive Telemetry Inspection**: 20-point historical time-series graph for any individual sensor.

### 🚑 Module 6 – Emergency Route Optimization
- **Dijkstra Shortest/Fastest Path Solver**: Graph engine on urban network edges with siren priority weights for **Ambulance, Fire Brigade, and Disaster Rescue Squads**.
- **Dynamic Impedance Calculation**: Penalizes congested corridors and avoids low-elevation flooded nodes.
- **Interactive Road Closure Barrier**: Barricade or open any corridor to witness instantaneous rerouting and detour delay calculation (+X mins).

### 🔮 Module 7 – Multi-System What-If Simulation Engine
- **Connected Cascade Physics**:
  1. Heavy Rainfall (0–180 mm/h) & Drainage Blockage (10–100%)
  2. Flash ponding at topographic depression points
  3. Underpass inundation & emergency road barricades
  4. Traffic spillover causing regional arterial gridlock
  5. Transformer peak thermal strain & safety circuit trips
- **Before-and-After Metrics**: Health score drop, at-risk population, gridlocked links, and rerouted emergency vehicles.

### 🔔 Module 8 – Alerts & Incident Command
- Filter by severity (Critical, Warning, Normal) and keyword search.
- Operator resolution timestamping and persistence.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 (SPA) with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **GIS Mapping**: Leaflet & OpenStreetMap (CartoDB Dark Matter)
- **Animations**: Framer Motion & CSS Radar Ping

### Backend
- **Framework**: Python 3.10+ & FastAPI
- **ASGI Server**: Uvicorn
- **Validation**: Pydantic v2
- **Database ORM**: SQLAlchemy 2.0 (PostgreSQL & SQLite)
- **Graph Algorithms**: NetworkX & Dijkstra
- **AI / Data**: Scikit-learn, NumPy, Pandas, Joblib

---

## 3. Project Architecture & Folder Structure

```
neural-city/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── database.py              # SQLAlchemy engine & session maker
│   │   ├── seed_data.py             # Demonstration Bengaluru topology & IoT seed
│   │   ├── models/
│   │   │   └── models.py            # 11 SQLAlchemy database models
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── dashboard.py         # /api/dashboard/overview
│   │   │   ├── locations.py         # /api/locations & /api/roads
│   │   │   ├── traffic.py           # /api/traffic/current, /history, /predict
│   │   │   ├── flood.py             # /api/flood/locations, /predict
│   │   │   ├── infrastructure.py    # /api/infrastructure/sensors, /readings
│   │   │   ├── alerts.py            # /api/alerts & acknowledge
│   │   │   ├── emergency.py         # /api/emergency/route & road-closure
│   │   │   └── simulation.py        # /api/simulation/run & history
│   │   ├── services/
│   │   │   ├── routing_service.py   # Dijkstra graph solver with hazard penalties
│   │   │   └── simulation_service.py# Cascading urban failure simulation logic
│   │   ├── ml/
│   │   │   ├── traffic_model.py     # AI traffic model inference
│   │   │   ├── flood_model.py       # Hydrological flood classifier
│   │   │   ├── train_traffic.py     # Traffic regression training script
│   │   │   └── train_flood.py       # Flood classifier training script
│   │   └── tests/
│   │       └── test_api.py          # Backend test suite
│   ├── requirements.txt             # Python backend dependencies
│   └── .env.example                 # Backend environment variable template
├── src/
│   ├── components/
│   │   ├── Header.tsx               # Top telemetry bar & status pills
│   │   ├── Sidebar.tsx              # Navigation & active alert badges
│   │   ├── CityOverview.tsx         # Dashboard overview (Module 1)
│   │   ├── GisMap.tsx               # Leaflet GIS Digital Twin (Module 2)
│   │   ├── TrafficPrediction.tsx    # AI Traffic Forecasting (Module 3)
│   │   ├── FloodPrediction.tsx      # AI Flood Risk (Module 4)
│   │   ├── InfrastructureMonitoring.tsx # SCADA/IoT Telemetry (Module 5)
│   │   ├── EmergencyRouting.tsx     # Dijkstra Dispatch & Closures (Module 6)
│   │   ├── WhatIfSimulation.tsx     # Cascading Simulation (Module 7)
│   │   ├── AlertsManager.tsx        # Incident Command (Module 8)
│   │   └── ArchitectureDocs.tsx     # Technical Architecture & APIs (Module 9)
│   ├── services/
│   │   └── api.ts                   # Centralized API service client
│   ├── App.tsx                      # Root application component
│   ├── main.tsx                     # React client mount
│   └── index.css                    # Global styles & Leaflet dark theme
├── server.ts                        # Full-stack Node/Express dev server with Vite
├── package.json                     # Node dependencies & npm scripts
├── vite.config.ts                   # Vite configuration
└── README.md                        # Documentation & user guide
```

---

## 4. Database Schema (11 Tables)

1. `locations`: Bengaluru demonstration zones, elevation (AMSL), coordinates, ward number.
2. `roads`: Road corridor links, capacity, speed limits, lane count, closure barriers.
3. `traffic_readings`: Historical & live vehicle speeds, counts, and congestion percentages.
4. `traffic_predictions`: Scikit-learn predicted congestion, horizon hours, confidence metrics.
5. `flood_observations`: Rainfall rates (mm/h), water level (m), drainage capacity (%).
6. `flood_predictions`: Hydrological classifications (LOW, MODERATE, HIGH, CRITICAL).
7. `infrastructure_sensors`: SCADA sensor registry, units, min/max thresholds.
8. `sensor_readings`: Time-series sensor measurements.
9. `alerts`: Active city incidents, severity levels, operator resolution logs.
10. `simulation_scenarios`: Stored multi-variable what-if parameter runs and cascade results.
11. `emergency_routes`: Log of computed emergency trajectories and avoided hazard intersections.

---

## 5. Exact Windows PowerShell Execution Guide

Run these commands in Windows PowerShell:

### A. Backend Setup & Run

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Train AI Models
python -m backend.app.ml.train_traffic
python -m backend.app.ml.train_flood

# 6. Run Backend Tests
pytest backend/app/tests/test_api.py -v

# 7. Start FastAPI Server (runs at http://localhost:8000)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

*Interactive FastAPI Swagger Docs will be available at:* `http://localhost:8000/docs`

---

### B. Frontend Setup & Run

In a separate PowerShell window at the project root:

```powershell
# 1. Install Node dependencies
npm install

# 2. Start Full-Stack Dev Server (runs at http://localhost:3000)
npm run dev
```

---

## 6. Model Limitations & Simulated Data Disclosure

1. **Simulated Demonstration Data**: The sensor telemetry, water pressure oscillations, and substation loads are realistic mathematical simulations designed for digital twin evaluation. They do not connect to live municipal SCADA networks.
2. **Topographic Grid**: Elevation AMSL values reflect actual Bengaluru topography (e.g., Hebbal lake basin depression at 888m vs MG Road at 920m), but localized sub-meter culvert geometry is illustrative.
3. **Emergency Routing**: Directions and times are computed via NetworkX / Dijkstra on the demonstration topological road graph and should not be used as live 911/112 operational emergency vehicle navigation.
