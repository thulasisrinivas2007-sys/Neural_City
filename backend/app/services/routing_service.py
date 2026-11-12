import heapq
import math
from typing import Dict, List, Any, Optional, Tuple

class EmergencyRoutingService:
    """
    Emergency route optimization graph engine.
    Supports Dijkstra's shortest/fastest path algorithm, dynamic congestion impedance,
    active road closure barriers, and flood hazard avoidance.
    """

    def __init__(self, locations: List[Dict[str, Any]], roads: List[Dict[str, Any]]):
        self.locations = {loc["id"]: loc for loc in locations}
        self.roads = roads
        self._build_graph()

    def _build_graph(self):
        self.adj: Dict[str, List[Dict[str, Any]]] = {loc_id: [] for loc_id in self.locations}
        for road in self.roads:
            src = road["source_location_id"]
            dst = road["target_location_id"]
            if src in self.adj and dst in self.adj:
                self.adj[src].append({
                    "to": dst,
                    "road_id": road["id"],
                    "road_name": road["name"],
                    "distance_km": road["distance_km"],
                    "speed_limit_kmh": road.get("speed_limit_kmh", 50.0),
                    "is_closed": road.get("is_closed", False),
                    "current_congestion": road.get("current_congestion", 0.2)
                })
                # Undirected urban road network
                self.adj[dst].append({
                    "to": src,
                    "road_id": road["id"],
                    "road_name": road["name"],
                    "distance_km": road["distance_km"],
                    "speed_limit_kmh": road.get("speed_limit_kmh", 50.0),
                    "is_closed": road.get("is_closed", False),
                    "current_congestion": road.get("current_congestion", 0.2)
                })

    def find_emergency_route(
        self,
        source_id: str,
        destination_id: str,
        service_type: str = "AMBULANCE",
        avoid_closed: bool = True,
        consider_congestion: bool = True,
        flood_hazard_nodes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        if source_id not in self.locations or destination_id not in self.locations:
            raise ValueError(f"Invalid source ({source_id}) or destination ({destination_id})")

        flood_hazard_set = set(flood_hazard_nodes or [])
        
        # Priority queue for Dijkstra: (cost_time_mins, current_node, path_history, road_history)
        pq: List[Tuple[float, str, List[str], List[Dict[str, Any]]]] = [(0.0, source_id, [source_id], [])]
        visited: Dict[str, float] = {}
        avoided_hazards = []

        while pq:
            current_time, u, path, road_path = heapq.heappop(pq)

            if u == destination_id:
                # Reconstruct full path
                total_dist = sum(r["distance_km"] for r in road_path)
                free_flow_time = sum((r["distance_km"] / (r["speed_limit_kmh"])) * 60.0 for r in road_path)
                delay_mins = max(0.0, current_time - free_flow_time)

                nodes_info = [self.locations[nid] for nid in path]
                route_polyline = [[loc["latitude"], loc["longitude"]] for loc in nodes_info]

                return {
                    "service_type": service_type,
                    "source_id": source_id,
                    "destination_id": destination_id,
                    "path_nodes": nodes_info,
                    "route_polyline": route_polyline,
                    "total_distance_km": round(total_dist, 2),
                    "estimated_time_mins": round(current_time, 1),
                    "congestion_delay_mins": round(delay_mins, 1),
                    "avoided_hazards": list(set(avoided_hazards)),
                    "road_segments": road_path
                }

            if u in visited and visited[u] <= current_time:
                continue
            visited[u] = current_time

            for edge in self.adj.get(u, []):
                v = edge["to"]
                
                # Check road closure
                if avoid_closed and edge["is_closed"]:
                    avoided_hazards.append(f"Road Closed: {edge['road_name']}")
                    continue

                # Check flood hazard at target node
                flood_penalty = 1.0
                if v in flood_hazard_set:
                    avoided_hazards.append(f"Flooded Area: {self.locations[v]['name']}")
                    flood_penalty = 3.5 # heavy impedance, encourages reroute

                # Calculate effective travel time
                base_time = (edge["distance_km"] / edge["speed_limit_kmh"]) * 60.0 # mins
                
                # Congestion factor: 0.0 -> 1.0 multiplier up to 3.0x
                congestion_mult = 1.0 + (edge["current_congestion"] * 2.2) if consider_congestion else 1.0
                
                # Emergency vehicles with siren have 25% lower delay
                siren_factor = 0.75 if service_type in ["AMBULANCE", "FIRE_BRIGADE"] else 1.0

                effective_edge_time = base_time * congestion_mult * flood_penalty * siren_factor

                next_time = current_time + effective_edge_time
                if v not in visited or next_time < visited[v]:
                    heapq.heappush(pq, (next_time, v, path + [v], road_path + [edge]))

        # If no route found (e.g. islands due to closures)
        return {
            "service_type": service_type,
            "source_id": source_id,
            "destination_id": destination_id,
            "path_nodes": [],
            "route_polyline": [],
            "total_distance_km": 0.0,
            "estimated_time_mins": 0.0,
            "congestion_delay_mins": 0.0,
            "avoided_hazards": ["No accessible route found due to severe road closures/flood barriers."],
            "road_segments": []
        }
