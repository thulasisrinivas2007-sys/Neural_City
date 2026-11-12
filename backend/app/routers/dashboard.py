from datetime import datetime
from fastapi import APIRouter
from ..seed_data import SEED_LOCATIONS, SEED_ROADS, SEED_SENSORS, SEED_ALERTS
from ..schemas.schemas import DashboardOverviewOut

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewOut)
def get_dashboard_overview():
    total_locations = len(SEED_LOCATIONS)
    avg_congestion = round(sum(r["current_congestion"] for r in SEED_ROADS) / len(SEED_ROADS) * 100, 1)
    
    traffic_status = "CRITICAL" if avg_congestion > 75 else ("ELEVATED" if avg_congestion > 50 else "NORMAL")
    
    # Calculate active alerts
    unack_alerts = [a for a in SEED_ALERTS if not a["is_acknowledged"]]
    crit_count = sum(1 for a in unack_alerts if a["severity"] == "CRITICAL")
    warn_count = sum(1 for a in unack_alerts if a["severity"] == "WARNING")

    # City health calculation
    health_score = round(max(30.0, 94.0 - (crit_count * 8.0) - (warn_count * 3.5) - (avg_congestion * 0.15)), 1)

    return {
        "monitored_locations_count": total_locations,
        "average_traffic_congestion_pct": avg_congestion,
        "traffic_status": traffic_status,
        "high_flood_risk_zones_count": 2, # Koramangala & Hebbal low-lying
        "flood_status": "MODERATE_WATCH",
        "water_infrastructure_health_pct": 91.5,
        "electricity_infrastructure_health_pct": 94.2,
        "active_critical_alerts_count": crit_count,
        "active_warning_alerts_count": warn_count,
        "city_health_score": health_score,
        "system_mode": "LIVE_SIMULATED_TWIN",
        "telemetry_timestamp": datetime.utcnow(),
        "quick_trends": {
            "traffic_change_1h": "+4.2%",
            "water_consumption_rate": "1,420 MLD",
            "power_draw_current": "3,180 MW",
            "storm_drain_capacity_avg": "78%"
        }
    }
