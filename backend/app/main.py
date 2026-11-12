from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import dashboard, locations, traffic, flood, infrastructure, alerts, emergency, simulation

app = FastAPI(
    title="NEURAL CITY – AI Urban Infrastructure Digital Twin API",
    description="Full-stack AI/ML, IoT, and GIS API for Bengaluru Smart Urban Digital Twin.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(locations.router)
app.include_router(traffic.router)
app.include_router(flood.router)
app.include_router(infrastructure.router)
app.include_router(alerts.router)
app.include_router(emergency.router)
app.include_router(simulation.router)

@app.get("/api/health")
def healthcheck():
    return {
        "status": "ONLINE",
        "system": "NEURAL CITY CORE ENGINE",
        "version": "1.0.0",
        "database": "CONNECTED",
        "simulation_engine": "READY"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
