#include "DisplayManager.h"

DisplayManager::DisplayManager() 
    : display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET), isOledConnected(false) {}

bool DisplayManager::init() {
    Wire.begin(PIN_OLED_SDA, PIN_OLED_SCL);

    // Initialize display with 0x3C address
    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
        // Fallback to 0x3D
        if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
            Serial.println("[Display] OLED SSD1306 not found at 0x3C or 0x3D. Running headless.");
            isOledConnected = false;
            return false;
        }
    }

    isOledConnected = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    showBootScreen();
    return true;
}

void DisplayManager::showBootScreen() {
    if (!isOledConnected) return;

    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(18, 10);
    display.println("FLOODGUARD IoT");
    display.drawFastHLine(0, 24, SCREEN_WIDTH, SSD1306_WHITE);

    display.setCursor(12, 34);
    display.println("Early Warning Sys");
    display.setCursor(22, 48);
    display.println("Initializing...");
    display.display();
    delay(1200);
}

void DisplayManager::drawProgressBar(int x, int y, int width, int height, float percent) {
    display.drawRect(x, y, width, height, SSD1306_WHITE);
    int fillWidth = (int)((percent / 100.0f) * (width - 4));
    if (fillWidth < 0) fillWidth = 0;
    if (fillWidth > (width - 4)) fillWidth = width - 4;
    display.fillRect(x + 2, y + 2, fillWidth, height - 4, SSD1306_WHITE);
}

void DisplayManager::update(const SensorReadings& sensors, const WaterMetrics& metrics, bool wifiConnected) {
    if (!isOledConnected) return;

    display.clearDisplay();

    // Line 1: Header + WiFi status
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("FloodGuard");
    display.setCursor(80, 0);
    display.print(wifiConnected ? "[WiFi:OK]" : "[WiFi:--]");
    display.drawFastHLine(0, 10, SCREEN_WIDTH, SSD1306_WHITE);

    // If sensor error
    if (sensors.sensorError) {
        display.setCursor(0, 18);
        display.println("!! SENSOR ERROR !!");
        display.setCursor(0, 32);
        display.println("Check HC-SR04 pins");
        display.setCursor(0, 46);
        display.print("Echo/Trig out of range");
        display.display();
        return;
    }

    // Line 2: Water Level in cm and percentage
    display.setCursor(0, 14);
    display.print("Level: ");
    display.setTextSize(1);
    display.print(metrics.waterLevelCm, 1);
    display.print("cm (");
    display.print((int)metrics.waterLevelPercent);
    display.println("%)");

    // Line 3: Graphical Fill Bar
    drawProgressBar(0, 26, 128, 8, metrics.waterLevelPercent);

    // Line 4: Status and Rain
    display.setCursor(0, 38);
    display.print("Status: ");
    display.print(metrics.alertLevelStr);

    display.setCursor(0, 48);
    display.print("Rain: ");
    display.print(sensors.rainStatusStr);

    // Line 5: Rate of rise or warning footer
    display.setCursor(0, 56);
    if (metrics.isRapidRise) {
        display.print(">> RAPID RISE! <<");
    } else {
        display.print("Slope: ");
        display.print(metrics.rateOfRiseCmPerMin, 1);
        display.print(" cm/m");
    }

    display.display();
}

void DisplayManager::showError(const char* message) {
    if (!isOledConnected) return;
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 10);
    display.println("SYSTEM ERROR:");
    display.setCursor(0, 30);
    display.println(message);
    display.display();
}
