/**
 * ============================================================================
 * Project: FloodGuard - Smart River Water Level Monitoring & Early Warning
 * Platform: ESP32 DevKit V1 (30-pin / 36-pin)
 * Developers: Tanishq Das (Reg. No: 23BAI10587) & Abhi Pandey (Reg. No: 23BAI10909)
 * Department: 4th Year B.Tech, School of Computing Science and Engineering
 * University: VIT Bhopal University
 * License: CERN Open Hardware Licence Version 2 (CERN-OHL-S)
 * ============================================================================
 */

#include "Config.h"
#include "Sensors.h"
#include "WaterLevel.h"
#include "AlertManager.h"
#include "DisplayManager.h"
#include "NetworkManager.h"

// Global Module Instances
Sensors sensors;
WaterLevelCalculator calculator(DEFAULT_TOTAL_DEPTH_CM);
AlertManager alertManager;
DisplayManager displayManager;
NetworkManager networkManager;

// Timing trackers for non-blocking loop
unsigned long lastSensorReadTime = 0;
unsigned long lastTelemetryTime  = 0;

// Current state cache
SensorReadings currentSensors;
WaterMetrics   currentMetrics;

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println();
    Serial.println("==================================================");
    Serial.println(" FloodGuard - Smart Water Level & Early Warning   ");
    Serial.println(" Tanishq Das (23BAI10587) | Abhi Pandey (23BAI10909)");
    Serial.println(" 4th Year B.Tech | VIT Bhopal University          ");
    Serial.println("==================================================");

    // 1. Initialize Alerts (Runs short LED + Buzzer hardware test)
    Serial.println("[Init] Initializing LEDs & Buzzer...");
    alertManager.init();

    // 2. Initialize Sensors (Trig/Echo, Rain ADC/Digital)
    Serial.println("[Init] Initializing Ultrasonic & Rain Sensors...");
    sensors.init();

    // 3. Initialize OLED Display
    Serial.println("[Init] Initializing SSD1306 OLED Display...");
    displayManager.init();

    // 4. Initialize WiFi & Network Telemetry
    Serial.println("[Init] Initializing WiFi & Web Server...");
    networkManager.init(WIFI_SSID_DEFAULT, WIFI_PASSWORD_DEFAULT);

    Serial.println("[System] Boot complete. Starting continuous monitoring loop.");
    Serial.println("--------------------------------------------------");
}

void loop() {
    unsigned long now = millis();

    // 1. Keep WiFi background reconnection and local server responsive
    networkManager.update();

    // 2. Periodic Sensor Acquisition and Water Level Calculation
    if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL_MS) {
        lastSensorReadTime = now;

        // Acquire raw readings from hardware
        currentSensors = sensors.readAll();

        // Calculate water level, percentage, and Rate-of-Rise
        currentMetrics = calculator.calculate(currentSensors.rawDistanceCm, currentSensors.distanceValid);

        // Update network manager cache for local web server
        networkManager.cacheLatestReadings(currentSensors, currentMetrics);

        // Update local OLED display
        displayManager.update(currentSensors, currentMetrics, networkManager.isConnected());

        // Output structured logging to Serial
        if (currentSensors.sensorError) {
            Serial.printf("[SENSOR ERROR] %s | Raw Dist: %.1f cm\n", 
                          currentSensors.errorMessage, currentSensors.rawDistanceCm);
        } else {
            Serial.printf("[MONITOR] Level: %5.1f cm (%3.0f%%) | Dist: %5.1f cm | Slope: %+5.1f cm/m | Alert: %-7s | Rain: %-10s %s\n",
                          currentMetrics.waterLevelCm,
                          currentMetrics.waterLevelPercent,
                          currentSensors.rawDistanceCm,
                          currentMetrics.rateOfRiseCmPerMin,
                          currentMetrics.alertLevelStr,
                          currentSensors.rainStatusStr,
                          currentMetrics.isRapidRise ? ">> [RAPID RISE DETECTED!] <<" : "");
        }
    }

    // 3. Update Visual & Audible Alerts (Continuous non-blocking flashing/beeping)
    alertManager.update(currentMetrics.alertLevel, currentMetrics.isRapidRise);

    // 4. Periodic Telemetry Transmission to Backend Dashboard
    if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryTime = now;
        networkManager.sendTelemetry(currentSensors, currentMetrics);
    }
}
