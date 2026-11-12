from typing import List, Dict, Any

SEED_LOCATIONS: List[Dict[str, Any]] = [
    {
        "id": "hebbal",
        "name": "Hebbal Flyover & Lake",
        "category": "transit_hub",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "elevation": 888.0, # Low-lying lake basin
        "ward_number": 7,
        "population_density": 18500
    },
    {
        "id": "yelahanka",
        "name": "Yelahanka Suburb",
        "category": "residential",
        "latitude": 13.1007,
        "longitude": 77.5963,
        "elevation": 915.0,
        "ward_number": 1,
        "population_density": 11200
    },
    {
        "id": "majestic",
        "name": "Majestic Central Station (KBS)",
        "category": "transit_hub",
        "latitude": 12.9767,
        "longitude": 77.5713,
        "elevation": 918.0,
        "ward_number": 94,
        "population_density": 29000
    },
    {
        "id": "indiranagar",
        "name": "Indiranagar 100ft Rd",
        "category": "commercial",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "elevation": 905.0,
        "ward_number": 112,
        "population_density": 16400
    },
    {
        "id": "koramangala",
        "name": "Koramangala 80ft Rd",
        "category": "commercial",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "elevation": 882.0, # Valley depression prone to storm runoff
        "ward_number": 151,
        "population_density": 21000
    },
    {
        "id": "whitefield",
        "name": "Whitefield ITPL Corridor",
        "category": "tech_corridor",
        "latitude": 12.9698,
        "longitude": 77.7500,
        "elevation": 922.0,
        "ward_number": 84,
        "population_density": 14500
    },
    {
        "id": "kr_market",
        "name": "KR Market (City Market)",
        "category": "trade_center",
        "latitude": 12.9634,
        "longitude": 77.5770,
        "elevation": 901.0,
        "ward_number": 119,
        "population_density": 34000
    },
    {
        "id": "mg_road",
        "name": "MG Road Central CBD",
        "category": "commercial",
        "latitude": 12.9756,
        "longitude": 77.6066,
        "elevation": 920.0,
        "ward_number": 111,
        "population_density": 19800
    },
    {
        "id": "silk_board",
        "name": "Silk Board Junction",
        "category": "transit_hub",
        "latitude": 12.9177,
        "longitude": 77.6238,
        "elevation": 890.0,
        "ward_number": 174,
        "population_density": 24000
    }
]

SEED_ROADS: List[Dict[str, Any]] = [
    {
        "id": "road-hebbal-yelahanka",
        "name": "Bellary Road Expressway (NH 44)",
        "source_location_id": "hebbal",
        "target_location_id": "yelahanka",
        "distance_km": 7.4,
        "speed_limit_kmh": 65.0,
        "capacity_vph": 4500,
        "lanes": 6,
        "is_closed": False,
        "current_congestion": 0.42
    },
    {
        "id": "road-hebbal-majestic",
        "name": "Outer Ring Rd to Seshadri Rd",
        "source_location_id": "hebbal",
        "target_location_id": "majestic",
        "distance_km": 8.1,
        "speed_limit_kmh": 45.0,
        "capacity_vph": 3800,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.68
    },
    {
        "id": "road-majestic-kr_market",
        "name": "Tank Bund & Avenue Road",
        "source_location_id": "majestic",
        "target_location_id": "kr_market",
        "distance_km": 2.2,
        "speed_limit_kmh": 35.0,
        "capacity_vph": 2800,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.82
    },
    {
        "id": "road-majestic-mg_road",
        "name": "Kasturba Road / Cubbon Park Corridor",
        "source_location_id": "majestic",
        "target_location_id": "mg_road",
        "distance_km": 4.1,
        "speed_limit_kmh": 45.0,
        "capacity_vph": 3200,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.54
    },
    {
        "id": "road-mg_road-indiranagar",
        "name": "Old Madras Road & CMH Road",
        "source_location_id": "mg_road",
        "target_location_id": "indiranagar",
        "distance_km": 3.9,
        "speed_limit_kmh": 45.0,
        "capacity_vph": 3100,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.61
    },
    {
        "id": "road-indiranagar-whitefield",
        "name": "HAL Old Airport Road Corridor",
        "source_location_id": "indiranagar",
        "target_location_id": "whitefield",
        "distance_km": 12.8,
        "speed_limit_kmh": 50.0,
        "capacity_vph": 3600,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.74
    },
    {
        "id": "road-kr_market-koramangala",
        "name": "Hosur Main Road Link",
        "source_location_id": "kr_market",
        "target_location_id": "koramangala",
        "distance_km": 6.3,
        "speed_limit_kmh": 45.0,
        "capacity_vph": 3400,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.59
    },
    {
        "id": "road-koramangala-silk_board",
        "name": "Sarjapur Road / Madiwala Underpass",
        "source_location_id": "koramangala",
        "target_location_id": "silk_board",
        "distance_km": 3.2,
        "speed_limit_kmh": 40.0,
        "capacity_vph": 4200,
        "lanes": 6,
        "is_closed": False,
        "current_congestion": 0.88
    },
    {
        "id": "road-silk_board-whitefield",
        "name": "Outer Ring Road (ORR) Tech Spine",
        "source_location_id": "silk_board",
        "target_location_id": "whitefield",
        "distance_km": 15.6,
        "speed_limit_kmh": 60.0,
        "capacity_vph": 5000,
        "lanes": 6,
        "is_closed": False,
        "current_congestion": 0.79
    },
    {
        "id": "road-mg_road-koramangala",
        "name": "Intermediate Ring Road (IRR)",
        "source_location_id": "mg_road",
        "target_location_id": "koramangala",
        "distance_km": 5.1,
        "speed_limit_kmh": 50.0,
        "capacity_vph": 3300,
        "lanes": 4,
        "is_closed": False,
        "current_congestion": 0.49
    }
]

SEED_SENSORS: List[Dict[str, Any]] = [
    {
        "id": "sens-hebbal-rain",
        "name": "Hebbal Sump Stormwater Inflow Sensor",
        "sensor_type": "WATER_LEVEL",
        "location_id": "hebbal",
        "unit": "m",
        "min_threshold": 0.5,
        "max_threshold": 3.8,
        "current_value": 2.1,
        "status": "NORMAL"
    },
    {
        "id": "sens-hebbal-power",
        "name": "Hebbal 220kV Grid Substation Main Transformer",
        "sensor_type": "POWER_LOAD",
        "location_id": "hebbal",
        "unit": "%",
        "min_threshold": 20.0,
        "max_threshold": 85.0,
        "current_value": 68.4,
        "status": "NORMAL"
    },
    {
        "id": "sens-koramangala-flow",
        "name": "Koramangala Valley Storm Drain Acoustic Flowmeter",
        "sensor_type": "WATER_FLOW",
        "location_id": "koramangala",
        "unit": "L/min",
        "min_threshold": 100.0,
        "max_threshold": 4800.0,
        "current_value": 3100.0,
        "status": "WARNING"
    },
    {
        "id": "sens-koramangala-power",
        "name": "Koramangala Tech Park Distribution Bus",
        "sensor_type": "POWER_VOLTAGE",
        "location_id": "koramangala",
        "unit": "V",
        "min_threshold": 215.0,
        "max_threshold": 242.0,
        "current_value": 231.5,
        "status": "NORMAL"
    },
    {
        "id": "sens-majestic-pipe",
        "name": "Majestic Central Water Feeder Main Pressure",
        "sensor_type": "WATER_PRESSURE",
        "location_id": "majestic",
        "unit": "bar",
        "min_threshold": 2.2,
        "max_threshold": 5.5,
        "current_value": 3.8,
        "status": "NORMAL"
    },
    {
        "id": "sens-whitefield-temp",
        "name": "Whitefield Export Substation Oil Thermal Sensor",
        "sensor_type": "TRANSFORMER_TEMP",
        "location_id": "whitefield",
        "unit": "°C",
        "min_threshold": 30.0,
        "max_threshold": 82.0,
        "current_value": 64.2,
        "status": "NORMAL"
    },
    {
        "id": "sens-silkboard-drain",
        "name": "Silk Board Underpass Sump Level",
        "sensor_type": "WATER_LEVEL",
        "location_id": "silk_board",
        "unit": "m",
        "min_threshold": 0.2,
        "max_threshold": 2.5,
        "current_value": 1.9,
        "status": "WARNING"
    },
    {
        "id": "sens-krmarket-pressure",
        "name": "KR Market Old Supply Line Hydraulic Pressure",
        "sensor_type": "WATER_PRESSURE",
        "location_id": "kr_market",
        "unit": "bar",
        "min_threshold": 2.0,
        "max_threshold": 5.0,
        "current_value": 1.7, # Below threshold indicating micro leakage
        "status": "WARNING"
    }
]

SEED_ALERTS: List[Dict[str, Any]] = [
    {
        "id": "alt-001",
        "location_id": "silk_board",
        "alert_type": "TRAFFIC_GRIDLOCK",
        "severity": "CRITICAL",
        "title": "Severe Bottleneck Surge at Silk Board",
        "description": "Peak hour volume exceeds rated link capacity by 142%. Average vehicle crawl speed dropped to 6 km/h. Signal timing override deployed.",
        "timestamp": "2026-11-12T03:15:00Z",
        "is_acknowledged": False
    },
    {
        "id": "alt-002",
        "location_id": "koramangala",
        "alert_type": "FLOOD_SURGE",
        "severity": "WARNING",
        "title": "Storm Drain Inflow Warning in 80ft Road",
        "description": "Acoustic flowmeter indicates 78% capacity saturation. Sump drainage pumps have been primed for automated cycle.",
        "timestamp": "2026-11-12T03:30:00Z",
        "is_acknowledged": False
    },
    {
        "id": "alt-003",
        "location_id": "kr_market",
        "alert_type": "WATER_LEAK",
        "severity": "WARNING",
        "title": "Subsurface Pipeline Pressure Anomaly",
        "description": "Feed line pressure decreased from 3.2 bar to 1.7 bar. Potential fissure detected in KR Market sector 4 piping.",
        "timestamp": "2026-11-12T03:40:00Z",
        "is_acknowledged": False
    }
]
