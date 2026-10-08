# FloodGuard Hardware Architecture & Circuit Documentation

## 1. System Overview

FloodGuard is designed as an open-source, low-cost Internet of Things (IoT) monitoring node based on the Espressif ESP32-WROOM-32 microcontroller. The physical setup measures water surface elevation and precipitation, provides immediate local visual and acoustic warnings, and broadcasts real-time telemetry over WiFi to the monitoring server.

```
                           +--------------------------+
                           |  Solar / Battery / 5V USB |
                           +------------+-------------+
                                        |
                                        v
+------------------+         +--------------------+         +-------------------+
| HC-SR04 Ultrasonic|<======>|   ESP32 DevKit V1  |<------->| SSD1306 0.96" OLED|
| (or JSN-SR04T)   |         |  (30/36-pin MCU)   |  (I2C)  | (128x64 display)  |
+------------------+         +---------+----------+         +-------------------+
                                       |
+------------------+                   |                    +-------------------+
| FC-37 Rain Sensor|<------------------+------------------->| Status LEDs (G/Y/R)|
| (Analog + Digital|                                        | + Active Buzzer   |
+------------------+                                        +-------------------+
```

---

## 2. Complete Pin Connection Table

| Subsystem | Component Pin | ESP32 GPIO | Electrical Level | Notes & Wiring Instructions |
| :--- | :--- | :--- | :--- | :--- |
| **Microcontroller** | VIN / 5V | External 5V / USB | 5.0V DC | Power supply input |
| | GND | Common GND | 0V | Ground bus |
| | 3V3 | 3.3V Output Rail | 3.3V DC | Supplies OLED & pull-ups |
| **Ultrasonic Sensor**<br>*(HC-SR04 / JSN-SR04T)* | VCC | 5V (VIN) | 5.0V | Ultrasonic transducers require 5V for full acoustic range |
| | GND | Common GND | 0V | Return ground |
| | TRIG | GPIO 5 | 3.3V Logic | ESP32 digital output (10µs trigger pulse) |
| | ECHO | **Voltage Divider**<br>*(To GPIO 18)* | **3.3V Logic** | **CRITICAL: HC-SR04 outputs 5V. Use 1kΩ / 2kΩ divider!** |
| **Rainfall Sensor**<br>*(FC-37 / YL-83)* | VCC | 3.3V (or 5V) | 3.3V / 5.0V | Connect to 3.3V rail for native ADC matching |
| | GND | Common GND | 0V | Return ground |
| | AO (Analog) | GPIO 34 | 0 – 3.3V | Connected to ADC1_CH6 (Safe with active WiFi) |
| | DO (Digital)| GPIO 19 | 3.3V Logic | Comparator output (Active LOW when rain detected) |
| **OLED Display**<br>*(SSD1306 0.96" I2C)* | VCC | 3V3 | 3.3V | Power rail |
| | GND | Common GND | 0V | Return ground |
| | SDA | GPIO 21 | 3.3V | I2C Data line (Internal or 4.7kΩ pull-up) |
| | SCL | GPIO 22 | 3.3V | I2C Clock line (Internal or 4.7kΩ pull-up) |
| **Visual Indicators** | Green LED (+) | GPIO 25 | 3.3V (via 330Ω) | NORMAL status indicator |
| | Yellow LED (+)| GPIO 26 | 3.3V (via 330Ω) | WARNING & RAPID RISE indicator |
| | Red LED (+)   | GPIO 27 | 3.3V (via 330Ω) | DANGER status indicator |
| | LED Cathodes(-)| Common GND | 0V | Ground rail |
| **Acoustic Alert** | Buzzer (+) | GPIO 14 | 3.3V / 5V | Active Piezo Buzzer (high-frequency alarm) |
| | Buzzer (-) | Common GND | 0V | Ground rail |

---

## 3. Critical Voltage Divider Calculation for Ultrasonic Echo

The HC-SR04 Echo pin outputs a $5.0\text{ V}$ pulse corresponding to sound transit time. Connecting $5.0\text{ V}$ directly to ESP32 GPIOs (which are rated for a maximum of $3.6\text{ V}$) can degrade or destroy the microcontroller input buffer over time.

We use a two-resistor voltage divider:
- $R_1 = 1.0\text{ k}\Omega$ (in series from HC-SR04 Echo to ESP32 GPIO 18)
- $R_2 = 2.0\text{ k}\Omega$ (from ESP32 GPIO 18 to Common Ground)

$$V_{\text{out}} = V_{\text{echo}} \times \left( \frac{R_2}{R_1 + R_2} \right) = 5.0\text{ V} \times \left( \frac{2000}{1000 + 2000} \right) = 5.0\text{ V} \times 0.667 = 3.33\text{ V}$$

$3.33\text{ V}$ is ideal for ESP32 high-logic threshold detection ($V_{IH} \ge 0.75 \times V_{DD} = 2.475\text{ V}$) while remaining safely below the $3.6\text{ V}$ absolute maximum rating.

---

## 4. Schematic Diagram (ASCII Representation)

```
                       ESP32 DEVKIT V1
                     +-----------------+
                     |                 |
  5V (VIN) --------->| VIN         3V3 |---------> 3.3V Power Rail
  GND      --------->| GND         GND |---------> Common GND Rail
                     |                 |
                     |         GPIO 21 |---------> OLED SDA
                     |         GPIO 22 |---------> OLED SCL
                     |                 |
                     |         GPIO 05 |---------> HC-SR04 TRIG
                     |         GPIO 18 |<----+    
                     |                 |     |
                     |         GPIO 34 |<----+--- Rain Sensor AO
                     |         GPIO 19 |<----+--- Rain Sensor DO
                     |                 |     |
                     |         GPIO 25 |-----+---> [330 ohm] ---> Green LED ---> GND
                     |         GPIO 26 |-----+---> [330 ohm] ---> Yellow LED --> GND
                     |         GPIO 27 |-----+---> [330 ohm] ---> Red LED -----> GND
                     |         GPIO 14 |-----+---> Active Buzzer (+) ----------> GND
                     +-----------------+     |
                                             |
   HC-SR04 ECHO Pin (5V Out)                 |
         |                                   |
         +-----[ 1.0k ohm Resistor (R1) ]----+
                                             |
                                             +-----[ 2.0k ohm Resistor (R2) ]---> GND
```

---

## 5. Outdoor Ruggedization: Upgrading to JSN-SR04T

While the bench prototype uses the common **HC-SR04** for clean indoor laboratory and transparent container testing, an outdoor riverbank deployment requires moisture and condensation resistance.

### Recommended Outdoor Ultrasonic Transducer: JSN-SR04T (V2.0 or V3.0)
- **Ingress Protection**: IP67 waterproof sealed transducer probe on a 2.5-meter shielded cable.
- **Pin Compatibility**: Identical 4-pin interface (VCC, GND, TRIG, ECHO). Drop-in replacement for HC-SR04!
- **Operating Voltage**: 3.0V – 5.5V DC.
- **Important Physical Difference**: The JSN-SR04T has a larger blind zone ($20\text{ cm}$ minimum distance) compared to HC-SR04 ($2\text{ cm}$). When mounting on a river bridge or culvert, the sensor bracket must be positioned at least $25\text{ cm}$ above the maximum anticipated flood crest.

---

## 6. Power Supply Options

1. **Bench Testing**: Standard micro-USB cable connected to a 5V 1A wall adapter or PC USB port.
2. **Field / Autonomous Deployment**:
   - Single-cell $3.7\text{ V}$ 18650 Lithium-Ion battery with TP4056 charging module and MT3608 boost converter to $5.0\text{ V}$.
   - Small $5\text{V} / 6\text{V}$, 2-watt monocrystalline solar panel for continuous daytime harvesting.
