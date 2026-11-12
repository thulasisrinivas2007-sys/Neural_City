"""
Database Initialization & Seeding Script for Supabase / PostgreSQL / SQLite
Creates all 11 tables and seeds initial Bengaluru digital twin demonstration records.
Supports SQLAlchemy when installed in venv, with automatic SQLite3 fallback.
"""
import sys
import json
import sqlite3

try:
    from .database import engine, Base, SessionLocal
    from .models.models import Location, Road, InfrastructureSensor, Alert
    from .seed_data import SEED_LOCATIONS, SEED_ROADS, SEED_SENSORS, SEED_ALERTS
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False

def init_with_sqlite3():
    print("[DB INIT] SQLAlchemy not found in system python, using standard sqlite3...")
    conn = sqlite3.connect("neural_city.db")
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'hub',
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        elevation REAL DEFAULT 900.0,
        ward_number INTEGER,
        population_density INTEGER DEFAULT 12000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS roads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source_location_id TEXT,
        target_location_id TEXT,
        distance_km REAL NOT NULL,
        speed_limit_kmh REAL DEFAULT 50.0,
        capacity_vph INTEGER DEFAULT 3000,
        lanes INTEGER DEFAULT 4,
        is_closed BOOLEAN DEFAULT 0,
        closure_reason TEXT,
        current_congestion REAL DEFAULT 0.2
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS infrastructure_sensors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sensor_type TEXT NOT NULL,
        location_id TEXT,
        unit TEXT NOT NULL,
        min_threshold REAL,
        max_threshold REAL,
        current_value REAL DEFAULT 0.0,
        status TEXT DEFAULT 'NORMAL',
        is_active BOOLEAN DEFAULT 1
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        location_id TEXT,
        alert_type TEXT NOT NULL,
        severity TEXT DEFAULT 'WARNING',
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_acknowledged BOOLEAN DEFAULT 0,
        acknowledged_by TEXT
    );
    """)

    from .seed_data import SEED_LOCATIONS, SEED_ROADS, SEED_SENSORS, SEED_ALERTS
    for loc in SEED_LOCATIONS:
        cur.execute("INSERT OR IGNORE INTO locations (id, name, category, latitude, longitude, elevation, ward_number, population_density) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (loc['id'], loc['name'], loc['category'], loc['latitude'], loc['longitude'], loc['elevation'], loc.get('ward_number'), loc['population_density']))

    for road in SEED_ROADS:
        cur.execute("INSERT OR IGNORE INTO roads (id, name, source_location_id, target_location_id, distance_km, speed_limit_kmh, capacity_vph, lanes, is_closed, current_congestion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (road['id'], road['name'], road['source_location_id'], road['target_location_id'], road['distance_km'], road['speed_limit_kmh'], road['capacity_vph'], road['lanes'], int(road['is_closed']), road['current_congestion']))

    for s in SEED_SENSORS:
        cur.execute("INSERT OR IGNORE INTO infrastructure_sensors (id, name, sensor_type, location_id, unit, min_threshold, max_threshold, current_value, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (s['id'], s['name'], s['sensor_type'], s['location_id'], s['unit'], s['min_threshold'], s['max_threshold'], s['current_value'], s['status']))

    for a in SEED_ALERTS:
        cur.execute("INSERT OR IGNORE INTO alerts (id, location_id, alert_type, severity, title, description, is_acknowledged) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (a['id'], a['location_id'], a['alert_type'], a['severity'], a['title'], a['description'], int(a.get('is_acknowledged', False))))

    conn.commit()
    conn.close()
    print("[DB INIT] SQLite3 tables created and seeded successfully!")

def init_and_seed_db():
    if not HAS_SQLALCHEMY:
        init_with_sqlite3()
        return

    print(f"[DB INIT] Connecting to database: {engine.url.render_as_string(hide_password=True)}")
    print("[DB INIT] Creating all 11 SQLAlchemy tables...")
    Base.metadata.create_all(bind=engine)
    print("[DB INIT] Tables verified/created successfully.")

    db = SessionLocal()
    try:
        # Seed Locations
        loc_count = db.query(Location).count()
        if loc_count == 0:
            for loc in SEED_LOCATIONS:
                db.add(Location(**loc))
            db.commit()

        # Seed Roads
        road_count = db.query(Road).count()
        if road_count == 0:
            for road in SEED_ROADS:
                db.add(Road(**road))
            db.commit()

        # Seed Sensors
        sensor_count = db.query(InfrastructureSensor).count()
        if sensor_count == 0:
            for s in SEED_SENSORS:
                db.add(InfrastructureSensor(**s))
            db.commit()

        # Seed Alerts
        alert_count = db.query(Alert).count()
        if alert_count == 0:
            for a in SEED_ALERTS:
                db.add(Alert(
                    id=a["id"],
                    location_id=a["location_id"],
                    alert_type=a["alert_type"],
                    severity=a["severity"],
                    title=a["title"],
                    description=a["description"],
                    is_acknowledged=a.get("is_acknowledged", False)
                ))
            db.commit()

        print("[DB INIT] Database initialization and seed complete!")
    except Exception as e:
        print(f"[DB ERROR] Error during database seeding: {e}", file=sys.stderr)
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed_db()
