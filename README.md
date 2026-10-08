# FloodGuard – Smart River Water Level Monitoring & Early Warning System

[![Open Hardware](https://img.shields.io/badge/Open_Hardware-CERN--OHL--S-blue.svg)](https://ohwr.org/cernohl)
[![Platform](https://img.shields.io/badge/Platform-ESP32-green.svg)](https://www.espressif.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Category](https://img.shields.io/badge/Category-Disaster_Management-orange.svg)](#)

A real, working, open-hardware IoT early warning prototype developed for disaster management Make-A-Thons and academic engineering competitions. FloodGuard continuously monitors river or drainage canal levels using non-contact ultrasonic sensing, measures surface rainfall, evaluates water capacity and **rate of rise** ($\Delta h / \Delta t$), and delivers graded local warnings (LEDs, OLED, active acoustic buzzer) alongside a clean, responsive real-time web dashboard.

---

## 📌 Key Engineering Features

1. **Non-Contact Acoustic Ranging**: Measures water elevation without submerging sensors into corrosive, silt-laden flood currents.
2. **Dual Sensor Inputs**:
   - HC-SR04 ultrasonic distance sensor (with median filtering for ripple/splash noise rejection).
   - FC-37 rainfall detector (analog + digital comparator).
3. **Proactive Rate-of-Rise Detection**:
   $$\text{Rate of Rise } (\text{cm/min}) = \frac{h(t_{\text{now}}) - h(t_{\text{prev}})}{\Delta t}$$
   Flags **"Rapid Rise Detected"** if water surges quickly (e.g. cloudburst or upstream release), sounding an early warning before the physical danger threshold is breached.
4. **Three-Tier Warning Framework**:
   - 🟢 **NORMAL**: Safe water level ($< 60\%$). Green LED active.
   - 🟡 **WARNING**: Approaching capacity ($60\% - 85\%$) or rapid surge. Yellow LED active + warning chirp.
   - 🔴 **DANGER**: Critical capacity ($\ge 85\%$). Red flashing LED + pulsing piezo acoustic alarm.
5. **Robust Fault Detection**: Explicitly identifies disconnected sensors or out-of-range echoes and displays **"Sensor Error"** instead of guessing or showing false readings.
6. **Zero-Dependency Python Backend & Responsive Dashboard**:
   - Pure Python standard library server (`http.server` + `sqlite3`).
   - Real-time Chart.js trend visualization with threshold indicators.
   - Dynamic river cross-section tank gauge.
   - Incident event log table.
   - Built-in Web Audio API buzzer tone synthesizer.
   - Autonomous flood simulator for demonstrations without live hardware.
7. **Redundant On-Chip Web Server**: The ESP32 hosts an emergency mini-dashboard on port 80, allowing direct phone/browser access even if the external server is offline!

---

## 📁 Repository Directory Structure

```
floodguard/
├── firmware/
│   ├── floodguard_esp32/
│   │   ├── floodguard_esp32.ino    # Main entry point & non-blocking execution loop
│   │   ├── Config.h                # Hardware pin definitions & calibration constants
│   │   ├── Sensors.h / .cpp        # Ultrasonic pulse timing, median filter, rain reading
│   │   ├── WaterLevel.h / .cpp     # Datum subtraction, capacity %, Rate-of-Rise slope
│   │   ├── AlertManager.h / .cpp   # Non-blocking LED flashing & buzzer alarm sequences
│   │   ├── DisplayManager.h / .cpp # SSD1306 0.96" I2C OLED graphical driver
│   │   └── NetworkManager.h / .cpp # WiFi station, HTTP telemetry POST, embedded web server
│   └── README.md                   # Arduino IDE library & flashing instructions
│
├── backend/
│   ├── server.py                   # Zero-dependency Python server (REST API, SQLite, Simulator)
│   ├── static/
│   │   ├── style.css               # Clean responsive dashboard stylesheet
│   │   └── app.js                  # Chart.js telemetry, DOM updates, Web Audio buzzer
│   └── templates/
│       └── index.html              # Responsive disaster management dashboard UI
│
├── hardware/
│   ├── CIRCUIT_DIAGRAM.md          # Schematics, pinout matrix, 5V->3.3V voltage divider
│   ├── BOM.md                      # Detailed Bill of Materials (USD & INR pricing)
│   └── CALIBRATION_GUIDE.md        # Physical setup, datum calibration & acoustics reference
│
├── docs/
│   ├── PROJECT_REPORT.md           # Complete 20-chapter technical engineering report
│   └── DEMO_GUIDE.md               # Make-A-Thon demonstration script & judge Q&A prep
│
└── README.md                       # Master documentation & quickstart
```

---

## ⚡ Quickstart Guide

### 1. Hardware Connections (Bench Prototype)

| Component | Pin | ESP32 GPIO | Electrical Connection Notes |
| :--- | :--- | :--- | :--- |
| **HC-SR04** | VCC / GND | VIN (5V) / GND | 5V power rail |
| | TRIG | GPIO 5 | Direct connection |
| | ECHO | GPIO 18 | **Via 1kΩ / 2kΩ voltage divider to 3.3V** |
| **Rain Sensor**| VCC / GND | 3V3 / GND | 3.3V power rail |
| | AO (Analog) | GPIO 34 | Connected to ADC1_CH6 (Safe with active WiFi) |
| | DO (Digital)| GPIO 19 | Direct connection |
| **OLED 0.96"** | SDA / SCL | GPIO 21 / 22 | Hardware I2C |
| **LEDs** | Green / Yellow / Red | GPIO 25, 26, 27| Each in series with 330Ω resistor to GND |
| **Buzzer** | Positive (+) | GPIO 14 | Active 5V / 3.3V Piezo Buzzer to GND |

*(See [hardware/CIRCUIT_DIAGRAM.md](hardware/CIRCUIT_DIAGRAM.md) for full schematic details).*

---

### 2. Running the Backend & Web Dashboard

The backend runs on Python 3 with **zero external dependencies** (no `pip install` required):

```bash
cd backend
python server.py --port 5000
```

Open your browser to: **`http://localhost:5000`**

#### Testing Without Hardware (Simulation Mode):
You can run the full multi-stage flood simulation immediately by passing `--simulate`:
```bash
python server.py --simulate
```
Or simply click the **"Start Autonomous Simulation"** button directly on the web dashboard!

---

### 3. Flashing the ESP32 Firmware

1. Install the **Arduino IDE** (or use PlatformIO).
2. Install the **ESP32 Board Package** (`Tools` -> `Board` -> `Boards Manager` -> search for `esp32`).
3. Install required libraries (`Sketch` -> `Include Library` -> `Manage Libraries`):
   - **Adafruit SSD1306**
   - **Adafruit GFX Library**
4. Open [firmware/floodguard_esp32/floodguard_esp32.ino](firmware/floodguard_esp32/floodguard_esp32.ino).
5. In `Config.h`, configure your WiFi network credentials:
   ```cpp
   #define WIFI_SSID_DEFAULT     "Your_WiFi_Or_Hotspot"
   #define WIFI_PASSWORD_DEFAULT "Your_Password"
   #define BACKEND_SERVER_URL    "http://<YOUR_COMPUTER_IP>:5000/api/telemetry"
   ```
6. Select **DOIT ESP32 DEVKIT V1**, select your COM port, and click **Upload**.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `GET /api/data` | GET | Returns latest telemetry reading, history (last 40 points), and simulator status |
| `POST /api/telemetry` | POST | Ingests JSON telemetry packet from ESP32 node into SQLite database |
| `GET /api/alerts` | GET | Returns chronological table of triggered flood incidents |
| `GET /api/config` | GET | Returns calibrated tank depth, warning %, danger %, and slope thresholds |
| `POST /api/config` | POST | Updates calibration parameters dynamically from dashboard |
| `POST /api/simulate/toggle`| POST | Starts/stops autonomous multi-stage flood simulation |
| `POST /api/simulate/surge` | POST | Injects an instant flash-flood surge (+10 cm) for live demonstration |

---

## 💰 Bill of Materials (Summary)

| Component | Quantity | Approx. Cost (INR) | Approx. Cost (USD) |
| :--- | :---: | :---: | :---: |
| ESP32 DevKit V1 | 1 | ₹380 | $4.60 |
| HC-SR04 Ultrasonic Sensor | 1 | ₹90 | $1.10 |
| FC-37 Rain Sensor Module | 1 | ₹75 | $0.90 |
| SSD1306 0.96" OLED Display | 1 | ₹180 | $2.20 |
| Diffused LEDs + Buzzer + Resistors | 1 set | ₹39 | $0.50 |
| Breadboard, Jumpers & Cable | 1 set | ₹250 | $3.00 |
| **Total Prototype Cost** | | **₹1,014** | **$12.32** |

*(See [hardware/BOM.md](hardware/BOM.md) for full breakdown and outdoor upgrade components).*

---

## ⚖️ Engineering Integrity Note

FloodGuard is designed as an honest, student-built engineering prototype for community monitoring and early warning. It does not make unsubstantiated claims such as "100% flood prevention" or "AI-powered future prediction." Instead, it relies on sound hydrological principles, non-contact physical instrumentation, and rapid slope detection to provide actionable warning lead time.
