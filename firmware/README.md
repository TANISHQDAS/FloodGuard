# FloodGuard ESP32 Firmware Guide

## Required Arduino IDE Libraries

Install these libraries from **Arduino IDE -> Tools -> Manage Libraries...**:

1. **Adafruit SSD1306** (by Adafruit) - version 2.5.7 or newer
2. **Adafruit GFX Library** (by Adafruit) - version 1.11.5 or newer
3. **ArduinoJson** (Optional, not strictly required since we format lightweight JSON directly)

## Board Selection

- Board: **DOIT ESP32 DEVKIT V1** (or generic "ESP32 Dev Module")
- Upload Speed: `921600` or `115200`
- Flash Frequency: `80MHz`
- Partition Scheme: `Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)`
- Port: Select the COM port corresponding to your CP2102/CH340 USB-to-UART bridge.

## Pinout Summary

| Peripheral | Component Pin | ESP32 GPIO | Description / Notes |
| :--- | :--- | :--- | :--- |
| **HC-SR04** | VCC | 5V (VIN) | Power supply |
| | GND | GND | Common ground |
| | TRIG | GPIO 5 | Trigger pulse output |
| | ECHO | GPIO 18 | **Must use voltage divider (1k/2k) from 5V to 3.3V!** |
| **Rain Sensor** | VCC | 3.3V / 5V | Power supply |
| | GND | GND | Common ground |
| | AO (Analog) | GPIO 34 | Analog input (ADC1 - safe with WiFi) |
| | DO (Digital)| GPIO 19 | Threshold digital output |
| **OLED 0.96"** | VCC | 3.3V | I2C power |
| | GND | GND | Ground |
| | SDA | GPIO 21 | I2C Data |
| | SCL | GPIO 22 | I2C Clock |
| **Green LED** | Anode (+) | GPIO 25 | In series with 220-330Ω resistor (Normal) |
| **Yellow LED**| Anode (+) | GPIO 26 | In series with 220-330Ω resistor (Warning / Rapid Rise) |
| **Red LED**   | Anode (+) | GPIO 27 | In series with 220-330Ω resistor (Danger) |
| **Buzzer**    | Positive (+) | GPIO 14 | Active 5V or 3.3V Buzzer |
| | Negative (-) | GND | Ground |

## WiFi & Backend Setup

In `Config.h`:
- Update `WIFI_SSID_DEFAULT` and `WIFI_PASSWORD_DEFAULT` with your WiFi router or smartphone mobile hotspot details.
- Update `BACKEND_SERVER_URL` with your computer's IP address (e.g. `http://192.168.1.50:5000/api/telemetry`).
- If no backend server is available, the ESP32 also hosts its own mini web dashboard on port 80 at `http://<ESP32_IP>/`!
