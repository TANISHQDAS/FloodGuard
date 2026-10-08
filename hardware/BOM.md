# FloodGuard – Bill of Materials (BOM)

**Project Name**: FloodGuard – Smart River Water Level Monitoring & Early Warning System  
**Category**: Open Hardware Student Prototype / Disaster Management Make-A-Thon  
**Target Budget**: Low-Cost (< $20 / < ₹1,500 for core prototype)

---

## 1. Core Student Prototype Bill of Materials

| No. | Item Description | Specification / Model | Qty | Unit Price (INR) | Unit Price (USD) | Total Price (INR) | Total Price (USD) | Common Sources |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| 1 | Microcontroller Board | ESP32 DevKit V1 (30-pin, CP2102/CH340) | 1 | ₹380 | $4.60 | ₹380 | $4.60 | Robu.in / Amazon / Electronics Market |
| 2 | Ultrasonic Distance Sensor | HC-SR04 (4-pin, 2cm–400cm range) | 1 | ₹90 | $1.10 | ₹90 | $1.10 | Local Hobby Store / Robu.in |
| 3 | Rain Sensor Module | FC-37 / YL-83 with LM393 Comparator | 1 | ₹75 | $0.90 | ₹75 | $0.90 | Robu.in / Amazon |
| 4 | Monochrome Graphic OLED | 0.96" SSD1306 I2C (128x64 Blue/White) | 1 | ₹180 | $2.20 | ₹180 | $2.20 | Robu.in / Amazon |
| 5 | Visual Indicators (LEDs) | 5mm Diffused LEDs (1x Red, 1x Yellow, 1x Green) | 3 | ₹3 | $0.04 | ₹9 | $0.12 | Local Electronics Store |
| 6 | Current Limiting Resistors | 330Ω ¼ Watt Metal Film Resistors (for LEDs) | 3 | ₹1 | $0.01 | ₹3 | $0.03 | Local Electronics Store |
| 7 | Voltage Divider Resistors | 1.0kΩ and 2.0kΩ ¼ Watt Resistors (Echo pin) | 2 | ₹1 | $0.01 | ₹2 | $0.02 | Local Electronics Store |
| 8 | Audible Alarm | 5V / 3.3V Active Piezo Buzzer | 1 | ₹25 | $0.30 | ₹25 | $0.30 | Robu.in / Electronics Market |
| 9 | Prototyping Breadboard | 830-Point Solderless Breadboard MB-102 | 1 | ₹120 | $1.45 | ₹120 | $1.45 | Robu.in / Amazon |
| 10 | Hookup Wires | 40-pin Male-to-Male & Male-to-Female Jumpers | 1 set | ₹70 | $0.85 | ₹70 | $0.85 | Local Store / Amazon |
| 11 | Power Supply / Cable | Micro-USB to USB-A Cable (1 meter) | 1 | ₹60 | $0.75 | ₹60 | $0.75 | Generic / Household |
| **Total Core Prototype Cost** | | | | **₹1,014** | **$12.32** | **₹1,014** | **$12.32** | *Well within standard student competition budget* |

---

## 2. Optional Field Upgrade & Ruggedization Modules

For teams moving beyond laboratory demonstration to field pilot deployments:

| No. | Item Description | Specification / Purpose | Qty | Unit Price (INR) | Unit Price (USD) | Practical Trade-offs |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| A | Waterproof Ultrasonic Sensor | JSN-SR04T V3.0 (IP67 sealed transducer) | 1 | ₹420 | $5.10 | Essential for rain/humidity. Note: 20cm blind zone requires elevated bridge mount. |
| B | Cellular GSM/GPRS Module | SIM800L with SMA Antenna | 1 | ₹390 | $4.70 | For remote river stretches without WiFi. Requires 2A burst power supply & SIM card. |
| C | Long-Range Radio Module | SX1278 LoRa 433MHz / 868MHz SPI Module | 1 | ₹350 | $4.25 | 2–5 km line-of-sight telemetry without cellular data subscription. |
| D | Solar Energy Harvester | 6V 2W Solar Panel + TP4056 + 18650 Cell | 1 set | ₹320 | $3.90 | Autonomous off-grid operation for continuous seasonal monitoring. |
| E | Weatherproof Enclosure | IP65 ABS Junction Box (150x100x70mm) | 1 | ₹190 | $2.30 | Protects electronics from direct rain and dust. |

---

## 3. Procurement & Component Selection Tips

1. **ESP32 Version**: Either the 30-pin or 36-pin DevKit V1 works identically. Ensure your driver matches the USB chip (CP2102 or CH340).
2. **HC-SR04 vs HC-SR04P**: If using the newer `HC-SR04P` or `RCWL-1601` which natively support 3.3V, you can omit the voltage divider resistors. However, for the classic 5V `HC-SR04`, the $1.0\text{ k}\Omega / 2.0\text{ k}\Omega$ voltage divider is strictly mandatory to protect the ESP32.
3. **Active vs Passive Buzzer**: Use an **active buzzer** (has a black potted bottom with a removable protective sticker). Active buzzers only need a `HIGH` logic level to sound. Passive buzzers require `tone()` frequency generation.
