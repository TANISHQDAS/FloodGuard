#include "NetworkManager.h"

NetworkManager::NetworkManager() 
    : wifiSsid(WIFI_SSID_DEFAULT), wifiPassword(WIFI_PASSWORD_DEFAULT), 
      lastReconnectAttempt(0), localServer(80) {}

void NetworkManager::init(const char* ssid, const char* pass) {
    wifiSsid = ssid;
    wifiPassword = pass;

    Serial.println("[Network] Connecting to WiFi: " + String(wifiSsid));
    WiFi.mode(WIFI_STA);
    WiFi.begin(wifiSsid, wifiPassword);

    // Give it a brief 4-second initial attempt
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 4000) {
        delay(250);
        Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("[Network] Connected! IP Address: " + WiFi.localIP().toString());
    } else {
        Serial.println("[Network] WiFi not connected. Will attempt background reconnect.");
    }

    setupLocalRoutes();
    localServer.begin();
    Serial.println("[Network] Embedded emergency HTTP server started on port 80.");
}

bool NetworkManager::isConnected() const {
    return WiFi.status() == WL_CONNECTED;
}

String NetworkManager::getIpAddress() const {
    if (isConnected()) {
        return WiFi.localIP().toString();
    }
    return "0.0.0.0";
}

void NetworkManager::update() {
    // Non-blocking WiFi reconnect check every 15 seconds
    if (WiFi.status() != WL_CONNECTED) {
        unsigned long now = millis();
        if (now - lastReconnectAttempt > 15000) {
            lastReconnectAttempt = now;
            Serial.println("[Network] Reconnecting to WiFi...");
            WiFi.disconnect();
            WiFi.reconnect();
        }
    }

    // Handle incoming client requests to embedded emergency web server
    localServer.handleClient();
}

void NetworkManager::cacheLatestReadings(const SensorReadings& sensors, const WaterMetrics& metrics) {
    cachedSensors = sensors;
    cachedMetrics = metrics;
}

bool NetworkManager::sendTelemetry(const SensorReadings& sensors, const WaterMetrics& metrics) {
    if (!isConnected()) {
        return false;
    }

    HTTPClient http;
    http.begin(BACKEND_SERVER_URL);
    http.setTimeout(1200); // 1.2s timeout to prevent blocking control loops
    http.addHeader("Content-Type", "application/json");

    // Construct JSON payload
    char jsonBuffer[384];
    snprintf(jsonBuffer, sizeof(jsonBuffer),
        "{"
        "\"device_id\":\"%s\","
        "\"distance_cm\":%.2f,"
        "\"water_level_cm\":%.2f,"
        "\"water_level_percent\":%.1f,"
        "\"rate_of_rise\":%.2f,"
        "\"is_rapid_rise\":%s,"
        "\"rain_analog\":%d,"
        "\"rain_status\":\"%s\","
        "\"alert_level\":\"%s\","
        "\"sensor_error\":%s,"
        "\"uptime_sec\":%lu"
        "}",
        DEVICE_ID,
        sensors.rawDistanceCm,
        metrics.waterLevelCm,
        metrics.waterLevelPercent,
        metrics.rateOfRiseCmPerMin,
        metrics.isRapidRise ? "true" : "false",
        sensors.rainRawAnalog,
        sensors.rainStatusStr,
        metrics.alertLevelStr,
        sensors.sensorError ? "true" : "false",
        millis() / 1000
    );

    int httpCode = http.POST(jsonBuffer);
    bool success = (httpCode >= 200 && httpCode < 300);

    if (success) {
        // Serial.println("[Network] Telemetry delivered successfully.");
    } else {
        Serial.printf("[Network] Telemetry POST failed (HTTP %d)\n", httpCode);
    }

    http.end();
    return success;
}

void NetworkManager::setupLocalRoutes() {
    localServer.on("/", HTTP_GET, [this]() {
        this->handleRoot();
    });

    localServer.on("/api/data", HTTP_GET, [this]() {
        this->handleJson();
    });
}

void NetworkManager::handleJson() {
    char jsonBuffer[384];
    snprintf(jsonBuffer, sizeof(jsonBuffer),
        "{"
        "\"device_id\":\"%s\","
        "\"distance_cm\":%.2f,"
        "\"water_level_cm\":%.2f,"
        "\"water_level_percent\":%.1f,"
        "\"rate_of_rise\":%.2f,"
        "\"is_rapid_rise\":%s,"
        "\"rain_status\":\"%s\","
        "\"alert_level\":\"%s\","
        "\"sensor_error\":%s"
        "}",
        DEVICE_ID,
        cachedSensors.rawDistanceCm,
        cachedMetrics.waterLevelCm,
        cachedMetrics.waterLevelPercent,
        cachedMetrics.rateOfRiseCmPerMin,
        cachedMetrics.isRapidRise ? "true" : "false",
        cachedSensors.rainStatusStr,
        cachedMetrics.alertLevelStr,
        cachedSensors.sensorError ? "true" : "false"
    );
    localServer.send(200, "application/json", jsonBuffer);
}

void NetworkManager::handleRoot() {
    String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>";
    html += "<title>FloodGuard Standalone Node</title>";
    html += "<style>";
    html += "body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:20px;text-align:center}";
    html += ".card{background:#1e293b;border-radius:12px;padding:20px;max-width:400px;margin:20px auto;box-shadow:0 4px 6px rgba(0,0,0,0.3)}";
    html += ".metric{font-size:2.4rem;font-weight:bold;margin:10px 0;color:#38bdf8}";
    html += ".badge{display:inline-block;padding:6px 14px;border-radius:20px;font-weight:bold;text-transform:uppercase;margin:10px 0}";
    html += ".NORMAL{background:#15803d;color:#fff}";
    html += ".WARNING{background:#ca8a04;color:#fff}";
    html += ".DANGER{background:#b91c1c;color:#fff;animation:blink 1s infinite}";
    html += ".alert-rapid{background:#ea580c;color:#fff;padding:8px;border-radius:6px;font-weight:bold;margin:10px 0}";
    html += "@keyframes blink{50%{opacity:0.6}}";
    html += "</style>";
    html += "<meta http-equiv='refresh' content='2'>"; // Auto refresh every 2s
    html += "</head><body>";
    html += "<div class='card'>";
    html += "<h2>FloodGuard Node</h2>";
    html += "<p>Hardware Standalone Emergency Monitor</p>";
    
    if (cachedSensors.sensorError) {
        html += "<div class='badge DANGER'>SENSOR ERROR</div>";
        html += "<p style='color:#f87171'>Ultrasonic reading failed or out-of-range.</p>";
    } else {
        html += "<div class='badge " + String(cachedMetrics.alertLevelStr) + "'>" + String(cachedMetrics.alertLevelStr) + "</div>";
        
        if (cachedMetrics.isRapidRise) {
            html += "<div class='alert-rapid'>RAPID RISE DETECTED (" + String(cachedMetrics.rateOfRiseCmPerMin, 1) + " cm/min)</div>";
        }

        html += "<div class='metric'>" + String(cachedMetrics.waterLevelCm, 1) + " cm</div>";
        html += "<p>Capacity: " + String((int)cachedMetrics.waterLevelPercent) + "%</p>";
        html += "<p>Rainfall: <strong>" + String(cachedSensors.rainStatusStr) + "</strong></p>";
        html += "<p>Rate of Rise: " + String(cachedMetrics.rateOfRiseCmPerMin, 1) + " cm/min</p>";
    }

    html += "<hr style='border:0;border-top:1px solid #334155;margin:20px 0'>";
    html += "<small style='color:#94a3b8'>Device ID: " + String(DEVICE_ID) + " | IP: " + WiFi.localIP().toString() + "</small>";
    html += "</div></body></html>";

    localServer.send(200, "text/html", html);
}
