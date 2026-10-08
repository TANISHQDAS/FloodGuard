# FloodGuard – Smart River Water Level Monitoring and Early Warning System
## Technical Project Report & Open Hardware Documentation

**Event**: Disaster Management Make-A-Thon  
**Target Category**: Low-Cost Internet of Things (IoT) & Community Early Warning Systems  
**Project Repository**: Open Hardware Academic Submission  
**License**: CERN Open Hardware Licence Version 2 (CERN-OHL-S)  

---

## Table of Contents
1. [Abstract](#1-abstract)
2. [Problem Statement](#2-problem-statement)
3. [Motivation](#3-motivation)
4. [Existing Problem](#4-existing-problem)
5. [Proposed Solution](#5-proposed-solution)
6. [System Architecture](#6-system-architecture)
7. [Hardware Components](#7-hardware-components)
8. [Circuit Diagram](#8-circuit-diagram)
9. [Software Architecture](#9-software-architecture)
10. [Working Principle](#10-working-principle)
11. [Water-Level Calculation](#11-water-level-calculation)
12. [Warning Logic](#12-warning-logic)
13. [Rate-of-Rise Detection](#13-rate-of-rise-detection)
14. [Dashboard](#14-dashboard)
15. [Testing](#15-testing)
16. [Results](#16-results)
17. [Limitations](#17-limitations)
18. [Future Improvements](#18-future-improvements)
19. [Cost Estimation](#19-cost-estimation)
20. [Conclusion](#20-conclusion)

---

## 1. Abstract

Flooding caused by intense seasonal monsoons, sudden cloudbursts, or urban drainage blockages represents one of the most frequent and destructive natural hazards affecting communities globally. In small rivers, tributaries, and urban stormwater canals, water levels often rise rapidly with minimal lead time. Commercial hydrological telemetry stations cost thousands of dollars, making dense catchment-wide deployment unaffordable for developing municipalities and grassroots disaster mitigation groups.

This report presents **FloodGuard**, an open-hardware, low-cost river water level monitoring and early warning prototype built using an ESP32 microcontroller, ultrasonic distance sensing, and surface precipitation detection. The system continuously measures water level relative to a calibrated datum, calculates both absolute capacity percentage and rate-of-rise ($\Delta h / \Delta t$), and classifies flood risk into three graded states: `NORMAL`, `WARNING`, and `DANGER`. Visual LEDs, an OLED local readout, and an active acoustic buzzer provide immediate on-site alerts, while WiFi-enabled telemetry feeds an interactive responsive web dashboard with historical trend charting. Built entirely with readily accessible components totaling under $13 (₹1,050), FloodGuard offers an accessible, practical, and reproducible baseline for community disaster readiness.

---

## 2. Problem Statement

How can we engineer a dependable, low-power, and affordable electronic monitoring node capable of:
1. Accurately determining rising water levels without immersing electrical sensors directly into corrosive or debris-laden river water;
2. Detecting precipitation and flagging rapid water surge rates before physical danger thresholds are breached;
3. Delivering both localized visual/audible alarms and remote dashboard telemetry under unpredictable network conditions; and
4. Operating reliably within a student-scale hardware budget without relying on black-box or exaggerated AI models?

---

## 3. Motivation

During flood events, the primary determinant of life safety and property salvage is **warning lead time**. In localized flash floods, the transition from a tranquil stream to an inundating torrent can happen within 15 to 45 minutes. When communities depend solely on regional meteorological forecasts or manual visual inspection of gauge marks, alerts often arrive after evacuation routes have already become impassable.

The motivation behind FloodGuard is to democratize early warning instrumentation. By demonstrating that a reliable early-warning prototype can be constructed from inexpensive, standard hobbyist components (ESP32, HC-SR04, rain sensors), we enable engineering students, civil defense volunteers, and local panchayats/municipalities to deploy monitoring stations along neglected culverts, stream crossings, and small bridges.

---

## 4. Existing Problem

Conventional flood monitoring and hydrological warning infrastructure suffers from distinct operational limitations:
- **Prohibitive Capital Cost**: Industrial radar and hydrostatic pressure gauge stations typically cost between $1,500 and $8,000 per installation, restricting their placement to major river basins.
- **Sensor Vulnerability**: Submerged contact sensors (such as float switches, mechanical pressure probes, or resistive water tapes) suffer from silt accumulation, biological fouling, corrosion, and damage from floating tree branches during high-velocity currents.
- **Lagging Alerts**: Most existing gauge networks report absolute levels at 1-hour or 3-hour intervals, failing to capture high-acceleration flash surges between reporting windows.
- **Single Point of Failure**: Systems that rely entirely on cellular cloud connectivity fail to sound local evacuation sirens if mobile cell towers collapse or lose power during severe storms.

---

## 5. Proposed Solution

FloodGuard resolves these challenges through a balanced, practical design:
- **Non-Contact Ultrasonic Sensing**: Positioned above the river or channel, the ultrasonic transducer emits downward acoustic pulses. The electronic components never contact flowing water, eliminating fouling and debris impact.
- **Dual Parameter Monitoring**: Tracks both water surface elevation and immediate surface precipitation via a raindrop sensor.
- **Proactive Rate-of-Rise Early Warning**: Computes the first derivative of water level with respect to time ($\Delta h / \Delta t$). If water level climbs faster than an established velocity threshold (e.g. $\ge 5\text{ cm/min}$ in a demo scale), a **"Rapid Rise Detected"** alert triggers even if the water is currently within safe static bounds.
- **Tiered Multi-Channel Alerting**: Combines on-site fail-safe indicators (Green/Yellow/Red LEDs + piezoceramic buzzer + I2C OLED screen) with automated WiFi/HTTP telemetry to a web dashboard.
- **Robust Error Handling**: Discards acoustical reflections using a 5-sample median filter and flags sensor disconnects explicitly with "Sensor Error" rather than displaying corrupt measurements.

---

## 6. System Architecture

The FloodGuard architecture follows a clean, modular pipeline:

```
[ Physical World ]
  * Water Surface (Air Column)
  * Rainfall Moisture
          |
          v
[ Input / Sensing Layer ]
  * Ultrasonic Sensor (HC-SR04 / JSN-SR04T)
  * Raindrop Sensor (FC-37 with LM393 Comparator)
          |
          v
[ Embedded Processing Node (ESP32) ]
  * Non-blocking 1s sampling loop
  * 5-sample median filter (noise & ripple rejection)
  * Distance-to-Level conversion (Datum subtraction)
  * Slope calculation: Delta h / Delta t
  * Threshold comparator: NORMAL / WARNING / DANGER
  * Out-of-bounds validation & Sensor Error trap
          |
          +------------------------------------+
          |                                    |
          v                                    v
[ Local Actuation & Display ]        [ Communication Layer ]
  * OLED SSD1306 Display (I2C)         * WiFi Station Mode (STA)
  * Tri-Color LED Indicators           * HTTP POST JSON Telemetry
  * Active Buzzer Alarm (Piezo)        * Fallback Embedded HTTP Server
                                               |
                                               v
                                     [ Backend & Storage ]
                                       * Python HTTP REST Service
                                       * SQLite3 Database
                                               |
                                               v
                                     [ Visualization Dashboard ]
                                       * Responsive Web Application
                                       * Chart.js Real-time Trend Graph
                                       * River Cross-Section Visual Gauge
                                       * Incident Warning Table
```

---

## 7. Hardware Components

The prototype utilizes dependable, standard components:

1. **ESP32 DevKit V1 (Espressif)**:
   - Dual-Core Tensilica Xtensa 32-bit LX6 running at 240 MHz.
   - Built-in 2.4 GHz 802.11 b/g/n WiFi.
   - 12-bit Analog-to-Digital Converter (ADC1 channels utilized to prevent WiFi conflicts).
2. **Ultrasonic Distance Transducer (HC-SR04)**:
   - Operating frequency: 40 kHz.
   - Detection range: 2 cm to 400 cm.
   - Effective angle: < 15 degrees.
   - *Note for outdoor field deployment: Drop-in replacement with waterproof JSN-SR04T.*
3. **Rain Sensor Module (FC-37 / YL-83)**:
   - Nickel-coated serpentine sensing board.
   - LM393 comparator providing both analog level (0–4095) and digital threshold flag.
4. **0.96-Inch Graphic OLED Display (SSD1306)**:
   - 128x64 pixel resolution.
   - 2-wire I2C interface (SDA: GPIO 21, SCL: GPIO 22).
5. **Audible & Visual Indicators**:
   - Red, Yellow, Green 5mm diffused LEDs with 330Ω current-limiting resistors.
   - Active 5V piezoceramic buzzer.
6. **Voltage Level Shifter / Divider**:
   - $1\text{ k}\Omega$ and $2\text{ k}\Omega$ metal film resistors to step down HC-SR04 5V Echo pulse to ESP32 3.3V GPIO.

---

## 8. Circuit Diagram

### 8.1 Pin Interconnection Matrix

| Source Component | Pin Name | Target Destination | Logic Level | Function |
| :--- | :--- | :--- | :--- | :--- |
| **HC-SR04** | VCC | ESP32 VIN (5V) | 5.0V | Sensor power rail |
| | GND | ESP32 GND | 0V | Ground reference |
| | TRIG | ESP32 GPIO 5 | 3.3V | Trigger pulse output (10µs) |
| | ECHO | Divider $R_1$ ($1\text{k}\Omega$) | 5.0V | High pulse duration output |
| **Voltage Divider** | Junction $R_1/R_2$ | ESP32 GPIO 18 | 3.33V | Safe logic level to ESP32 |
| | $R_2$ Bottom | ESP32 GND | 0V | Pull-down leg ($2\text{k}\Omega$) |
| **Rain Sensor** | VCC | ESP32 3V3 | 3.3V | Sensor board supply |
| | GND | ESP32 GND | 0V | Ground reference |
| | AO (Analog) | ESP32 GPIO 34 | 0 – 3.3V | ADC1 Channel 6 analog input |
| | DO (Digital)| ESP32 GPIO 19 | 3.3V | Rain threshold comparator |
| **OLED Display** | VCC | ESP32 3V3 | 3.3V | Display power |
| | GND | ESP32 GND | 0V | Ground reference |
| | SDA | ESP32 GPIO 21 | 3.3V | I2C Data bus |
| | SCL | ESP32 GPIO 22 | 3.3V | I2C Clock bus |
| **Indicators** | Green LED | ESP32 GPIO 25 | 3.3V via 330Ω | NORMAL state visual signal |
| | Yellow LED| ESP32 GPIO 26 | 3.3V via 330Ω | WARNING / Rapid Rise visual signal |
| | Red LED | ESP32 GPIO 27 | 3.3V via 330Ω | DANGER state visual signal |
| | Active Buzzer| ESP32 GPIO 14 | 3.3V | High-decibel alarm signal |

---

## 9. Software Architecture

The firmware is structured into modular C++ classes:

- **`Config.h`**: Hardware pin maps, default container datum ($40.0\text{ cm}$), warning ($60\%$) and danger ($85\%$) thresholds, and WiFi configurations.
- **`Sensors.cpp`**: Controls ultrasonic pulse sequencing, executes 5-sample burst median filtering, evaluates rain moisture classification, and traps hardware timeout faults.
- **`WaterLevel.cpp`**: Implements datum conversion, percentage normalization, circular buffer history maintenance, and rate-of-rise slope estimation.
- **`AlertManager.cpp`**: Handles non-blocking execution of LED patterns (steady vs flashing) and buzzer pulsation frequencies using `millis()` without calling `delay()`.
- **`DisplayManager.cpp`**: Drives the SSD1306 OLED, drawing a water level capacity bar, status text, and diagnostic flags.
- **`NetworkManager.cpp`**: Maintains WiFi connectivity, serializes telemetry into JSON, dispatches HTTP POST requests, and serves an emergency standalone web dashboard directly from the ESP32.

---

## 10. Working Principle

The physical measurement and warning loop proceeds through sequential phases:

```
[Start Sampling Cycle]
          |
          v
[Trigger Ultrasonic Burst: 10us HIGH on GPIO 5]
          |
          v
[Measure Echo Time-of-Flight via pulseIn with 25ms timeout]
          |
          v
[Take 5 Bursts -> Discard Anomalies -> Compute Median Distance]
          |
          +---- (If Distance <= 0 or > 400 cm) ----> [Trigger SENSOR ERROR State]
          |
          v (Valid Distance)
[Calculate Water Level: h = H_total - d]
          |
          v
[Calculate Capacity Percentage: P = (h / H_total) * 100%]
          |
          v
[Calculate Slope: Rate of Rise = Delta h / Delta t]
          |
     +----+----+
     |         |
     v         v
 (P >= 85%)  (P >= 60% OR Rapid Rise >= 5 cm/min)
     |         |
     |         +---> [WARNING State: Yellow LED ON, Intermittent Beep]
     v
 [DANGER State: Red LED Blinking, Continuous Buzzer Alarm]
     |
     +---------> [Update OLED Screen & Send JSON Telemetry over WiFi]
```

---

## 11. Water-Level Calculation

The system converts raw ultrasonic air-gap distance into true liquid level:

Let:
- $H_{\text{total}}$ = Calibrated vertical distance from the sensor face to the container base / riverbed ($40.0\text{ cm}$).
- $d_{\text{raw}}$ = Distance measured between the sensor face and the water surface ($2.0\text{ cm} \le d_{\text{raw}} \le 400.0\text{ cm}$).

The instantaneous water elevation $h(t)$ is given by:

$$h(t) = \max\left(0.0, \, \min\left(H_{\text{total}}, \, H_{\text{total}} - d_{\text{raw}}\right)\right)$$

The fill percentage relative to maximum channel depth is:

$$\text{Capacity } (\%) = \left( \frac{h(t)}{H_{\text{total}}} \right) \times 100\%$$

---

## 12. Warning Logic

The system utilizes a 3-tier warning framework:

| Warning Tier | Water Capacity Condition | Rate-of-Rise Condition | Visual Actuation | Acoustic Actuation | Dashboard Alert Banner |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **NORMAL** | $< 60\%$ | $< 5.0\text{ cm/min}$ | Green LED Steady | Muted | None |
| **WARNING** | $60\% \le P < 85\%$ | OR $\ge 5.0\text{ cm/min}$ | Yellow LED Steady / Flashing | Intermittent warning chirp | Amber Advisory Banner |
| **DANGER** | $\ge 85\%$ | Any | Red LED Rapid Flash ($2.5\text{ Hz}$) | Pulsing alarm ($400\text{ms ON} / 200\text{ms OFF}$) | Crimson Critical Banner |
| **SENSOR ERROR**| Invalid distance / Timeout | N/A | Alternating Red/Yellow | Muted | Red Fault Banner |

---

## 13. Rate-of-Rise Detection

A distinctive strength of FloodGuard is its **proactive slope detection**. In sudden downpours or dam discharge events, waiting for water to breach the $85\%$ capacity threshold can eliminate valuable evacuation lead time.

The firmware maintains a 10-entry circular history buffer storing pairs of $[h_i, t_i]$. Every calculation cycle:

$$\Delta h = h_{\text{current}} - h_{\text{oldest\_in\_window}}$$
$$\Delta t = \frac{t_{\text{current}} - t_{\text{oldest\_in\_window}}}{60000} \quad (\text{minutes})$$
$$\text{Rate of Rise } (\text{cm/min}) = \frac{\Delta h}{\Delta t}$$

If $\text{Rate of Rise} \ge 5.0\text{ cm/min}$ (with $\Delta h \ge 0.5\text{ cm}$ and $\Delta t \ge 2.0\text{ s}$ to reject noise):
1. The system elevates immediately to **`WARNING`** status regardless of whether the water is currently at only $20\%$ or $30\%$ capacity.
2. The OLED displays **`>> RAPID RISE! <<`**.
3. The dashboard flashes the dedicated orange alert banner.

---

## 14. Dashboard

The monitoring dashboard is built with responsive HTML5, modern CSS variables, and Chart.js, served by a zero-dependency Python backend:

- **Primary Metrics**: Live displays of Water Level (cm), Capacity (%), Rainfall status, and Rate of Rise (cm/min).
- **Physical Cross-Section Tank Gauge**: A dynamic CSS representation of the river cross-section showing rising water, complete with dashed threshold markers for Warning ($60\%$) and Danger ($85\%$).
- **Live Trend Chart**: Real-time line plot showing the last 40 data points with threshold demarcation lines.
- **Incident & Warning Log**: Tabular record of all alert transitions with timestamps and water levels.
- **Web Audio Buzzer**: Synthesizes authentic piezo alarm tones through laptop speakers for testing.
- **Interactive Calibration Panel**: Allows updating tank depth, warning percentage, danger percentage, and slope thresholds dynamically.
- **Make-A-Thon Evaluation Tools**: Includes buttons to toggle the autonomous multi-stage flood simulation and inject flash flood surges on command.

---

## 15. Testing

The prototype underwent systematic bench testing using a transparent acrylic container ($45\text{ cm}$ total height, $20\text{ cm}$ diameter) calibrated with $H_{\text{total}} = 40.0\text{ cm}$:

### Test Scenario Matrix:

| Test Case | Procedure | Expected Outcome | Observed Result |
| :---: | :--- | :--- | :--- |
| **TC-01: Baseline Calibration** | Dry empty tank | Level: $0.0\text{ cm}$, Green LED ON, Status: NORMAL | Level $0.0\text{ cm}$, Green LED ON. PASS. |
| **TC-02: Normal Inflow** | Pour water slowly up to $15\text{ cm}$ ($37.5\%$) | Green LED remains ON, OLED shows $15\text{ cm}$, Slope $< 3\text{ cm/min}$ | Accurate tracking, no false warnings. PASS. |
| **TC-03: Warning Threshold** | Fill tank to $25\text{ cm}$ ($62.5\%$) | Yellow LED turns ON, OLED shows WARNING, Dashboard logs alert | Immediate transition to Yellow LED. PASS. |
| **TC-04: Danger Threshold** | Fill tank to $35\text{ cm}$ ($87.5\%$) | Red LED blinks, Buzzer sounds $400/200\text{ms}$ pulse, DANGER on dashboard | Loud alarm triggered, Red LED active. PASS. |
| **TC-05: Rapid Rise Detection** | Tank at $12\text{ cm}$ ($30\%$). Pour water rapidly ($+6\text{ cm}$ in $4\text{ s}$) | System flags RAPID RISE, Yellow LED flashes, chirp sounds | Detected slope $+90\text{ cm/min}$, flagged advisory instantly. PASS. |
| **TC-06: Rainfall Detection** | Drop water onto rain sensor grid | Status shifts from "No Rain" to "Heavy Rain" on OLED and Dashboard | Immediate analog drop, status updated. PASS. |
| **TC-07: Sensor Disconnection** | Unplug HC-SR04 Echo wire | OLED shows "SENSOR ERROR", Dashboard displays fault banner | System refuses to guess; displays SENSOR ERROR. PASS. |

---

## 16. Results

The test evaluations demonstrated that:
1. **Measurement Accuracy**: Within the $5\text{ cm}$ to $35\text{ cm}$ range, ultrasonic measurements matched a physical steel ruler within $\pm 0.3\text{ cm}$.
2. **Response Latency**: The maximum latency between water level crossing a threshold and local LED/buzzer actuation was $< 1.1\text{ seconds}$.
3. **Telemetry Reliability**: Data packets delivered over local 2.4 GHz WiFi to the Python server had a $100\%$ success rate with average round-trip time under $45\text{ ms}$.
4. **False Alarm Immunity**: Thanks to the 5-sample median filter, surface ripples generated by pouring water did not cause sporadic spikes in static depth.

---

## 17. Limitations

As a transparent engineering prototype, FloodGuard acknowledges the following constraints:
- **Acoustic Conical Spread**: The HC-SR04 beam angle ($\approx 15^\circ$) can detect sidewalls if placed inside very narrow pipes ($< 10\text{ cm}$ diameter).
- **Temperature Dependence**: Speed of sound varies with ambient temperature ($0.6\text{ m/s}$ per $1^\circ\text{C}$). Without a temperature probe (e.g. DS18B20), readings can drift by $\approx 1.5\%$ across extreme seasonal shifts ($0^\circ\text{C}$ to $40^\circ\text{C}$).
- **Sensor Environmental Sealing**: The basic HC-SR04 lacks waterproofing. Prolonged exposure to heavy rain or mist requires upgrading to the sealed JSN-SR04T probe.
- **WiFi Dependency for Remote Dashboard**: In remote forest or river canyons without local WiFi or hotspot coverage, the node can only sound local sirens unless paired with GSM/LoRa.

---

## 18. Future Improvements

1. **JSN-SR04T Waterproof Integration**: Integrate an IP67-rated ultrasonic transducer for all-weather outdoor bridge installations.
2. **LoRa Long-Range Mesh Telemetry**: Implement an SX1278 transceiver enabling 5 km transmissions across river valleys without cellular fees.
3. **Solar Energy Harvesting**: Add a 6V 2W solar panel, TP4056 charger, and single 18650 Li-ion cell to achieve permanent off-grid autonomy.
4. **Temperature Compensation**: Add a DS18B20 digital thermometer to continuously adjust sound velocity calculation ($c = 331.3 + 0.606 \times T$).
5. **Community SMS Gateway**: Pair with a SIM800L module to broadcast automated SMS evacuation notices directly to village leaders' mobile phones.

---

## 19. Cost Estimation

A granular breakdown demonstrates the exceptional cost-effectiveness of the FloodGuard architecture:

| Component | Description | Cost (INR) | Cost (USD) |
| :--- | :--- | :--- | :--- |
| ESP32 DevKit V1 | Dual-core Wi-Fi/BLE MCU | ₹380 | $4.60 |
| HC-SR04 Sensor | Ultrasonic Distance Module | ₹90 | $1.10 |
| FC-37 Rain Sensor | Rain Moisture Detector + LM393 | ₹75 | $0.90 |
| SSD1306 OLED Display | 0.96" I2C Monochrome Screen | ₹180 | $2.20 |
| Diffused LEDs (x3) | Green, Yellow, Red Status Indicators | ₹9 | $0.12 |
| Active Buzzer | 5V Piezoelectric Acoustic Alarm | ₹25 | $0.30 |
| Resistors & Breadboard | Metal film resistors & 830-pt board | ₹125 | $1.50 |
| Hookup Wires & USB Cable| Jumper wires & power interconnect | ₹130 | $1.60 |
| **Total Prototype Cost** | | **₹1,014** | **$12.32** |

Compared to commercial hydrological telemetry setups costing over $1,500, FloodGuard achieves a **>99% cost reduction**, proving that practical early warning is achievable for student and community initiatives.

---

## 20. Conclusion

FloodGuard demonstrates that life-saving early warning systems do not require exorbitant budgets or complex, opaque artificial intelligence. By combining robust physical principles (time-of-flight acoustic sensing), pragmatic mathematical modeling (rate-of-rise derivation and median filtering), and an inexpensive ESP32 microcontroller, FloodGuard delivers a dependable, transparent, and reproducible disaster monitoring solution.

The prototype successfully fulfills all Make-A-Thon objectives: it detects water levels accurately, warns of rapid flood onset, alerts local citizens through distinct multi-level sensory indicators, logs real-time telemetry to an intuitive web dashboard, and gracefully flags sensor malfunctions. As an open-hardware initiative, FloodGuard serves as a solid foundation for grassroots disaster risk reduction and community resilience.
