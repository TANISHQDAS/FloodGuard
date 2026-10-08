#ifndef DISPLAY_MANAGER_H
#define DISPLAY_MANAGER_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "Config.h"
#include "Sensors.h"
#include "WaterLevel.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C // Commonly 0x3C or 0x3D

class DisplayManager {
public:
    DisplayManager();
    bool init();
    void showBootScreen();
    void update(const SensorReadings& sensors, const WaterMetrics& metrics, bool wifiConnected);
    void showError(const char* message);

private:
    Adafruit_SSD1306 display;
    bool isOledConnected;
    void drawProgressBar(int x, int y, int width, int height, float percent);
};

#endif // DISPLAY_MANAGER_H
