#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include "Config.h"
#include "Sensors.h"
#include "WaterLevel.h"

class NetworkManager {
public:
    NetworkManager();
    void init(const char* ssid = WIFI_SSID_DEFAULT, const char* pass = WIFI_PASSWORD_DEFAULT);
    void update();
    bool isConnected() const;
    String getIpAddress() const;

    bool sendTelemetry(const SensorReadings& sensors, const WaterMetrics& metrics);
    void cacheLatestReadings(const SensorReadings& sensors, const WaterMetrics& metrics);

private:
    const char* wifiSsid;
    const char* wifiPassword;
    unsigned long lastReconnectAttempt;
    WebServer localServer;

    SensorReadings cachedSensors;
    WaterMetrics cachedMetrics;

    void setupLocalRoutes();
    void handleRoot();
    void handleJson();
};

#endif // NETWORK_MANAGER_H
