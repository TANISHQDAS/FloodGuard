#!/usr/bin/env python3
"""
FloodGuard Backend Server & Real-Time Disaster Management Dashboard
Zero-dependency Python 3 implementation with SQLite persistence, REST API,
live dashboard, and interactive hardware simulator.
"""

import sys
import os
import time
import math
import json
import sqlite3
import argparse
import threading
from datetime import datetime, timezone
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Configuration defaults
PORT = 5000
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "floodguard.db")
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")

# Global simulation state
simulation_active = False
sim_thread = None
sim_lock = threading.Lock()

# Global state cache
latest_reading = {
    "device_id": "FG-NODE-01",
    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "distance_cm": 30.0,
    "water_level_cm": 10.0,
    "water_level_percent": 25.0,
    "rate_of_rise": 0.0,
    "is_rapid_rise": False,
    "rain_status": "No Rain",
    "alert_level": "NORMAL",
    "sensor_error": False,
    "uptime_sec": 0
}

# ============================================================================
# Database Initialization & Management
# ============================================================================

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Telemetry data table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            device_id TEXT NOT NULL,
            distance_cm REAL,
            water_level_cm REAL,
            water_level_percent REAL,
            rate_of_rise REAL,
            is_rapid_rise INTEGER,
            rain_status TEXT,
            alert_level TEXT,
            sensor_error INTEGER
        )
    """)

    # Alerts history log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            water_level_cm REAL,
            water_level_percent REAL,
            message TEXT NOT NULL
        )
    """)

    # Calibration & Configuration table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY,
            total_depth_cm REAL DEFAULT 40.0,
            warning_threshold_percent REAL DEFAULT 60.0,
            danger_threshold_percent REAL DEFAULT 85.0,
            rapid_rise_threshold REAL DEFAULT 5.0
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM config")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO config (id, total_depth_cm, warning_threshold_percent, danger_threshold_percent, rapid_rise_threshold) VALUES (1, 40.0, 60.0, 85.0, 5.0)")

    conn.commit()
    conn.close()

def log_alert_if_needed(new_reading):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Retrieve most recent alert
    cursor.execute("SELECT alert_type FROM alerts ORDER BY id DESC LIMIT 1")
    last_alert_row = cursor.fetchone()
    last_alert_type = last_alert_row[0] if last_alert_row else "NORMAL"

    current_level = new_reading.get("alert_level", "NORMAL")
    is_rapid = new_reading.get("is_rapid_rise", False)
    ts = new_reading.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    # Log transition or rapid rise event
    if current_level != last_alert_type and current_level in ["WARNING", "DANGER"]:
        msg = f"Water level reached {current_level} threshold ({new_reading['water_level_cm']:.1f} cm, {new_reading['water_level_percent']:.0f}%)"
        cursor.execute("INSERT INTO alerts (timestamp, alert_type, water_level_cm, water_level_percent, message) VALUES (?, ?, ?, ?, ?)",
                       (ts, current_level, new_reading["water_level_cm"], new_reading["water_level_percent"], msg))
        conn.commit()
    elif is_rapid and last_alert_type != "RAPID_RISE":
        msg = f"Rapid rate of rise detected: +{new_reading['rate_of_rise']:.1f} cm/min!"
        cursor.execute("INSERT INTO alerts (timestamp, alert_type, water_level_cm, water_level_percent, message) VALUES (?, ?, ?, ?, ?)",
                       (ts, "RAPID_RISE", new_reading["water_level_cm"], new_reading["water_level_percent"], msg))
        conn.commit()

    conn.close()

def record_telemetry(data):
    global latest_reading
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data["timestamp"] = ts

    cursor.execute("""
        INSERT INTO telemetry (
            timestamp, device_id, distance_cm, water_level_cm, 
            water_level_percent, rate_of_rise, is_rapid_rise, 
            rain_status, alert_level, sensor_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ts,
        data.get("device_id", "UNKNOWN"),
        data.get("distance_cm", 0.0),
        data.get("water_level_cm", 0.0),
        data.get("water_level_percent", 0.0),
        data.get("rate_of_rise", 0.0),
        1 if data.get("is_rapid_rise") else 0,
        data.get("rain_status", "No Rain"),
        data.get("alert_level", "NORMAL"),
        1 if data.get("sensor_error") else 0
    ))
    conn.commit()
    conn.close()

    with sim_lock:
        latest_reading = data

    log_alert_if_needed(data)

# ============================================================================
# Autonomous Simulation Engine
# ============================================================================

def simulation_worker():
    global simulation_active, latest_reading
    print("[Simulator] Autonomous simulation started.")
    
    total_depth = 40.0
    current_water_level = 8.0 # Start in safe normal zone
    step = 0
    surge_ticks = 0

    while simulation_active:
        step += 1
        rain_status = "No Rain"
        
        # Simulate realistic multi-stage flood scenario
        # 0-20: Normal dry state
        # 21-40: Rain starts, steady rise
        # 41-70: Cloudburst / Rapid Rise surge
        # 71-90: Danger crest
        # 91-120: Drainage / Recession
        cycle = step % 120

        if cycle < 20:
            rain_status = "No Rain"
            # Small random ripple
            current_water_level = 8.0 + 0.5 * math.sin(step * 0.2)
        elif cycle < 40:
            rain_status = "Light Rain"
            current_water_level += 0.4
        elif cycle < 70:
            rain_status = "Heavy Rain"
            current_water_level += 0.85 # Rapid Rise slope!
        elif cycle < 90:
            rain_status = "Heavy Rain"
            current_water_level = 36.5 + 0.3 * math.sin(step * 0.3) # DANGER level
        else:
            rain_status = "Light Rain" if cycle < 105 else "No Rain"
            current_water_level = max(8.0, current_water_level - 0.7)

        # Clamping
        current_water_level = max(2.0, min(total_depth, current_water_level))
        distance_cm = total_depth - current_water_level
        percent = (current_water_level / total_depth) * 100.0

        # Calculate rate of rise (cm/min) based on last water level
        prev_level = latest_reading.get("water_level_cm", current_water_level)
        delta = current_water_level - prev_level
        # simulated 1 tick = 1.5s -> cm per minute = delta * (60 / 1.5)
        rate_of_rise = round(delta * 40.0, 1)

        is_rapid = (rate_of_rise >= 5.0)

        # Alert level classification
        if percent >= 85.0:
            alert_level = "DANGER"
        elif percent >= 60.0 or is_rapid:
            alert_level = "WARNING"
        else:
            alert_level = "NORMAL"

        sim_data = {
            "device_id": "FG-SIM-01",
            "distance_cm": round(distance_cm, 1),
            "water_level_cm": round(current_water_level, 1),
            "water_level_percent": round(percent, 1),
            "rate_of_rise": rate_of_rise,
            "is_rapid_rise": is_rapid,
            "rain_status": rain_status,
            "alert_level": alert_level,
            "sensor_error": False,
            "uptime_sec": step * 2
        }

        record_telemetry(sim_data)
        time.sleep(1.5)

    print("[Simulator] Autonomous simulation stopped.")

# ============================================================================
# HTTP Request Handler & REST API
# ============================================================================

class FloodGuardHandler(BaseHTTPRequestHandler):

    def send_json(self, status_code, payload):
        response_bytes = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Main Dashboard UI
        if path == "/" or path == "/index.html":
            index_file = os.path.join(TEMPLATES_DIR, "index.html")
            if os.path.exists(index_file):
                with open(index_file, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "Index template not found.")
            return

        # 2. Static Assets (CSS, JS)
        if path.startswith("/static/"):
            rel_path = path[len("/static/"):]
            full_path = os.path.join(STATIC_DIR, rel_path)
            if os.path.exists(full_path) and os.path.isfile(full_path):
                content_type = "text/plain"
                if full_path.endswith(".css"):
                    content_type = "text/css"
                elif full_path.endswith(".js"):
                    content_type = "application/javascript"
                elif full_path.endswith(".png"):
                    content_type = "image/png"
                elif full_path.endswith(".svg"):
                    content_type = "image/svg+xml"

                with open(full_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            else:
                self.send_error(404, "Static file not found")
                return

        # 3. API: Get Latest Telemetry & History
        if path == "/api/data":
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # Fetch last 40 data points for graph
            cursor.execute("""
                SELECT timestamp, water_level_cm, water_level_percent, rate_of_rise, alert_level, rain_status
                FROM telemetry
                ORDER BY id DESC LIMIT 40
            """)
            rows = cursor.fetchall()
            conn.close()

            # Reverse rows to chronological order
            history = []
            for r in reversed(rows):
                history.append({
                    "timestamp": r[0],
                    "water_level_cm": r[1],
                    "water_level_percent": r[2],
                    "rate_of_rise": r[3],
                    "alert_level": r[4],
                    "rain_status": r[5]
                })

            with sim_lock:
                current = dict(latest_reading)

            payload = {
                "current": current,
                "history": history,
                "simulation_active": simulation_active
            }
            self.send_json(200, payload)
            return

        # 4. API: Get Alerts Log
        if path == "/api/alerts":
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, timestamp, alert_type, water_level_cm, water_level_percent, message
                FROM alerts ORDER BY id DESC LIMIT 25
            """)
            rows = cursor.fetchall()
            conn.close()

            alerts_list = []
            for r in rows:
                alerts_list.append({
                    "id": r[0],
                    "timestamp": r[1],
                    "alert_type": r[2],
                    "water_level_cm": r[3],
                    "water_level_percent": r[4],
                    "message": r[5]
                })
            self.send_json(200, {"alerts": alerts_list})
            return

        # 5. API: Get System Configuration
        if path == "/api/config":
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("SELECT total_depth_cm, warning_threshold_percent, danger_threshold_percent, rapid_rise_threshold FROM config WHERE id = 1")
            row = cursor.fetchone()
            conn.close()

            if row:
                config_data = {
                    "total_depth_cm": row[0],
                    "warning_threshold_percent": row[1],
                    "danger_threshold_percent": row[2],
                    "rapid_rise_threshold": row[3]
                }
            else:
                config_data = {
                    "total_depth_cm": 40.0,
                    "warning_threshold_percent": 60.0,
                    "danger_threshold_percent": 85.0,
                    "rapid_rise_threshold": 5.0
                }
            self.send_json(200, config_data)
            return

        self.send_error(404, "API endpoint not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Read JSON body
        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_length)
        data = {}
        if post_body:
            try:
                data = json.loads(post_body.decode("utf-8"))
            except Exception as e:
                self.send_json(400, {"status": "error", "message": "Invalid JSON format"})
                return

        # 1. API: Telemetry Ingestion from ESP32
        if path == "/api/telemetry":
            record_telemetry(data)
            self.send_json(200, {"status": "success", "message": "Telemetry received and logged"})
            return

        # 2. API: Toggle Simulation Mode
        if path == "/api/simulate/toggle":
            global simulation_active, sim_thread
            simulation_active = not simulation_active
            if simulation_active:
                sim_thread = threading.Thread(target=simulation_worker, daemon=True)
                sim_thread.start()
            self.send_json(200, {"simulation_active": simulation_active})
            return

        # 3. API: Inject Rapid Surge for Demo
        if path == "/api/simulate/surge":
            global latest_reading
            with sim_lock:
                current_level = latest_reading.get("water_level_cm", 12.0)
                new_level = min(38.0, current_water_level if 'current_water_level' in locals() else current_level + 10.0)
                sim_data = {
                    "device_id": "FG-DEMO-TRIGGER",
                    "distance_cm": round(40.0 - new_level, 1),
                    "water_level_cm": round(new_level, 1),
                    "water_level_percent": round((new_level / 40.0) * 100.0, 1),
                    "rate_of_rise": 12.5,
                    "is_rapid_rise": True,
                    "rain_status": "Heavy Rain",
                    "alert_level": "WARNING" if new_level < 34 else "DANGER",
                    "sensor_error": False,
                    "uptime_sec": latest_reading.get("uptime_sec", 0) + 10
                }
                record_telemetry(sim_data)
            self.send_json(200, {"status": "surge_injected", "new_level": new_level})
            return

        # 4. API: Update Configuration
        if path == "/api/config":
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE config 
                SET total_depth_cm = ?, warning_threshold_percent = ?, danger_threshold_percent = ?, rapid_rise_threshold = ?
                WHERE id = 1
            """, (
                data.get("total_depth_cm", 40.0),
                data.get("warning_threshold_percent", 60.0),
                data.get("danger_threshold_percent", 85.0),
                data.get("rapid_rise_threshold", 5.0)
            ))
            conn.commit()
            conn.close()
            self.send_json(200, {"status": "success", "message": "Configuration updated"})
            return

        self.send_error(404, "Endpoint not found")

    def log_message(self, format, *args):
        # Suppress spammy polling logs in console
        if "/api/data" in args[0]:
            return
        super().log_message(format, *args)

# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="FloodGuard Disaster Monitoring Server")
    parser.add_argument("--port", type=int, default=PORT, help="Port to listen on (default: 5000)")
    parser.add_argument("--simulate", action="store_true", help="Start with autonomous simulator running")
    args = parser.parse_args()

    init_db()

    global simulation_active, sim_thread
    if args.simulate:
        simulation_active = True
        sim_thread = threading.Thread(target=simulation_worker, daemon=True)
        sim_thread.start()

    server_address = ("0.0.0.0", args.port)
    HTTPServer.allow_reuse_address = True
    httpd = HTTPServer(server_address, FloodGuardHandler)

    print("==================================================")
    print(" FloodGuard Disaster Warning Backend Server       ")
    print(f" Web Dashboard: http://localhost:{args.port}/     ")
    print(f" Telemetry API: http://localhost:{args.port}/api/telemetry")
    print(f" Simulator Status: {'ACTIVE' if args.simulate else 'IDLE'}")
    print(" Press Ctrl+C to terminate server                 ")
    print("==================================================")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down FloodGuard Server...")
        simulation_active = False
        httpd.server_close()

if __name__ == "__main__":
    main()
