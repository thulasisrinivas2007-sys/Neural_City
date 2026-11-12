import uuid
from datetime import datetime
from typing import Dict, Any, List
from ..ml.flood_model import flood_model
from ..ml.traffic_model import traffic_model

class SimulationService:
    """
    Connected Multi-System Urban Digital Twin Simulation Engine.
    Simulates cross-domain cascading infrastructure failures:
    Rainfall -> Drainage Stress -> Inundation -> Road Disruptions -> Traffic Spillover -> Grid/Water Strain.
    """

    def run_simulation(
        self,
        scenario_name: str,
        rainfall_intensity_mm: float,
        drainage_capacity_pct: float,
        traffic_surge_factor: float,
        water_demand_factor: float,
        electricity_demand_factor: float,
        simulated_road_closures: List[str],
        locations: List[Dict[str, Any]],
        roads: List[Dict[str, Any]],
        sensors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        scenario_id = f"sim-{uuid.uuid4().hex[:8]}"
        cascade_chain = []
        flood_impacts = []
        traffic_impacts = []
        power_water_impacts = []
        affected_locations = set()
        at_risk_pop = 0

        # Step 1: Flood Evaluation per location
        flooded_location_ids = []
        for loc in locations:
            elev = loc.get("elevation", 900.0)
            res = flood_model.predict(
                elevation_m=elev,
                rainfall_mm_h=rainfall_intensity_mm,
                drainage_capacity_pct=drainage_capacity_pct
            )
            is_flooded = res["predicted_risk_level"] in ["HIGH", "CRITICAL"]
            if is_flooded:
                flooded_location_ids.append(loc["id"])
                affected_locations.add(loc["id"])
                at_risk_pop += loc.get("population_density", 10000)

            flood_impacts.append({
                "location_id": loc["id"],
                "location_name": loc["name"],
                "elevation_m": elev,
                "risk_level": res["predicted_risk_level"],
                "risk_probability": res["risk_probability"],
                "water_depth_cm": res["water_accumulation_depth_cm"]
            })

        if rainfall_intensity_mm > 40.0:
            cascade_chain.append(
                f"Heavy precipitation of {rainfall_intensity_mm} mm/h overwhelmed primary stormwater drains, triggering flash ponding in {len(flooded_location_ids)} low-elevation sectors."
            )

        # Step 2: Road & Traffic Impact
        # Corridors connected to flooded nodes suffer severe disruption
        disrupted_roads_count = len(simulated_road_closures)
        for road in roads:
            src = road["source_location_id"]
            dst = road["target_location_id"]
            base_congestion = road.get("current_congestion", 0.3)
            
            is_submerged = src in flooded_location_ids or dst in flooded_location_ids
            is_manually_closed = road["id"] in simulated_road_closures
            
            if is_submerged or is_manually_closed:
                disrupted_roads_count += 1
                simulated_congestion = 0.96 # Near complete standstill
                status = "BLOCKED_SUBMERGED" if is_submerged else "CLOSED_PROTOCOL"
            else:
                # Spillover traffic surge
                simulated_congestion = min(0.95, base_congestion * traffic_surge_factor * (1.2 if len(flooded_location_ids) > 2 else 1.0))
                status = "CONGESTED" if simulated_congestion > 0.65 else "FLOWING"

            traffic_impacts.append({
                "road_id": road["id"],
                "road_name": road["name"],
                "original_congestion": base_congestion,
                "simulated_congestion": round(simulated_congestion, 2),
                "status": status
            })

        if disrupted_roads_count > 0:
            cascade_chain.append(
                f"{disrupted_roads_count} arterial road links suffered severe gridlock or waterlogging closures, diverting regional traffic into bottleneck corridors."
            )

        # Step 3: Infrastructure (Power & Water) Strain
        substation_stress = round(min(100.0, 68.0 * electricity_demand_factor + (15.0 if rainfall_intensity_mm > 50 else 0)), 1)
        water_pressure_drop = round(min(60.0, 15.0 * water_demand_factor + (25.0 if drainage_capacity_pct < 40 else 0)), 1)

        power_water_impacts = [
            {
                "subsystem": "Electricity Distribution Grid",
                "parameter": "Transformer Peak Load",
                "simulated_value": f"{substation_stress}%",
                "status": "CRITICAL" if substation_stress > 88 else ("WARNING" if substation_stress > 75 else "STABLE"),
                "risk_description": "Transformer thermal overload and moisture leakage warning in flooded substations."
            },
            {
                "subsystem": "Municipal Water Network",
                "parameter": "Pipeline Hydraulic Stress",
                "simulated_value": f"-{water_pressure_drop}% pressure",
                "status": "WARNING" if water_pressure_drop > 30 else "OPTIMAL",
                "risk_description": "Pressure oscillation in peripheral supply zones due to elevated runoff backflow."
            }
        ]

        if substation_stress > 80:
            cascade_chain.append(
                f"Regional electrical substations entered caution threshold ({substation_stress}% load) due to safety pump activations and heating loads."
            )

        # Step 4: Compute Overall City Health Score
        # Baseline = 88.0
        baseline_health = 88.0
        health_penalty = (len(flooded_location_ids) * 6.5) + (disrupted_roads_count * 4.0) + (rainfall_intensity_mm * 0.1) + ((100.0 - drainage_capacity_pct) * 0.15)
        simulated_health = max(24.0, round(baseline_health - health_penalty, 1))

        return {
            "scenario_id": scenario_id,
            "timestamp": datetime.utcnow(),
            "inputs": {
                "scenario_name": scenario_name,
                "rainfall_intensity_mm": rainfall_intensity_mm,
                "drainage_capacity_pct": drainage_capacity_pct,
                "traffic_surge_factor": traffic_surge_factor,
                "water_demand_factor": water_demand_factor,
                "electricity_demand_factor": electricity_demand_factor,
                "simulated_road_closures": simulated_road_closures
            },
            "baseline_health_score": baseline_health,
            "simulated_health_score": simulated_health,
            "health_score_delta": round(simulated_health - baseline_health, 1),
            "affected_locations_count": len(affected_locations),
            "at_risk_population": at_risk_pop,
            "cascade_chain": cascade_chain,
            "flood_impacts": flood_impacts,
            "traffic_impacts": traffic_impacts,
            "power_water_impacts": power_water_impacts,
            "rerouted_emergency_paths": max(1, len(flooded_location_ids) + disrupted_roads_count // 2)
        }

simulation_service = SimulationService()
