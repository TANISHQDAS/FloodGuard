#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ============================================================================
// FloodGuard ESP32 Pin Assignments
// ============================================================================

// Ultrasonic Sensor Pins (HC-SR04 or JSN-SR04T)
// Note: HC-SR04 Echo pin outputs 5V. Use a voltage divider (1k / 2k) to 3.3V GPIO!
const uint8_t PIN_TRIG = 5;
const uint8_t PIN_ECHO = 18;

// Rain Sensor Pins (FC-37 / YL-83)
// Note: Use ADC1 pins (GPIO 32-39) on ESP32 because ADC2 is disabled when WiFi is active!
const uint8_t PIN_RAIN_ANALOG  = 34; // Analog input (ADC1_CH6)
const uint8_t PIN_RAIN_DIGITAL = 19; // Digital threshold input

// Visual & Audio Alert Pins
const uint8_t PIN_LED_GREEN  = 25; // Normal Water Level
const uint8_t PIN_LED_YELLOW = 26; // Warning Water Level / Rapid Rise
const uint8_t PIN_LED_RED    = 27; // Danger Water Level
const uint8_t PIN_BUZZER     = 14; // Active 5V / 3.3V Buzzer

// I2C Display Pins (SSD1306 0.96" OLED)
// Default ESP32 hardware I2C pins
const uint8_t PIN_OLED_SDA = 21;
const uint8_t PIN_OLED_SCL = 22;

// ============================================================================
// Calibration & Physical Dimensions (Defaults for Make-A-Thon Demo Tank)
// ============================================================================

// Total distance from sensor face to the bottom of the container/riverbed (cm)
// In a demo tank, say 40.0 cm total depth.
// Water level = TOTAL_DEPTH_CM - Measured Distance
const float DEFAULT_TOTAL_DEPTH_CM = 40.0f;

// Minimum blind-zone distance for ultrasonic sensor (cm)
// HC-SR04 has ~2.0 cm blind zone; JSN-SR04T has ~20.0 cm blind zone.
const float SENSOR_MIN_DISTANCE_CM = 2.0f;
const float SENSOR_MAX_DISTANCE_CM = 400.0f;

// Threshold Percentages
const float THRESHOLD_WARNING_PERCENT = 60.0f; // 60% of total depth
const float THRESHOLD_DANGER_PERCENT  = 85.0f; // 85% of total depth

// Rate of Rise Trigger: Level increase rate considered "Rapid Rise"
// Calculated as cm per minute. In a bench demo with pouring water, 
// a rise of >= 4.0 cm/min (or rapid delta over 3-5 sec) triggers the early warning.
const float RAPID_RISE_THRESHOLD_CM_PER_MIN = 5.0f;

// Rain Analog Thresholds (12-bit ADC: 0 to 4095 on ESP32)
// Note: Most rain sensor boards output HIGH (near 4095) when dry, LOW (near 0) when submerged.
const int RAIN_DRY_THRESHOLD   = 3500;
const int RAIN_LIGHT_THRESHOLD = 2200;

// ============================================================================
// Timing Constants
// ============================================================================
const unsigned long SENSOR_READ_INTERVAL_MS = 1000; // Read sensors every 1s
const unsigned long TELEMETRY_INTERVAL_MS   = 2000; // Send telemetry every 2s
const unsigned long RATE_OF_RISE_WINDOW_MS  = 10000; // 10s sliding window for slope

// ============================================================================
// WiFi & Backend Configuration
// ============================================================================
// Replace with your local WiFi credentials or smartphone hotspot
#define WIFI_SSID_DEFAULT     "FloodGuard_Hotspot"
#define WIFI_PASSWORD_DEFAULT "floodguard123"

// Telemetry ingestion endpoint:
// Local Next.js Dashboard: "http://<YOUR_LAPTOP_IP>:3000/api/telemetry"
// Deployed Vercel App:      "https://<YOUR_APP>.vercel.app/api/telemetry"
#define BACKEND_SERVER_URL    "http://192.168.4.2:3000/api/telemetry"

// Device Identity
#define DEVICE_ID             "FG-NODE-01"
#define FIRMWARE_VERSION      "2.0.0-OpenHardware-Production"

#endif // CONFIG_H
