#ifndef WATER_LEVEL_H
#define WATER_LEVEL_H

#include <Arduino.h>
#include "Config.h"

enum AlertLevel {
    ALERT_NORMAL = 0,
    ALERT_WARNING = 1,
    ALERT_DANGER = 2,
    ALERT_ERROR = 3
};

struct WaterMetrics {
    float waterLevelCm;          // Calculated water level in cm
    float waterLevelPercent;     // Percentage of total depth (0 - 100%)
    float rateOfRiseCmPerMin;    // Slope of rising water (cm / min)
    bool isRapidRise;            // Flag: water rising unusually fast
    AlertLevel alertLevel;       // NORMAL, WARNING, DANGER, ERROR
    const char* alertLevelStr;   // String representation
};

class WaterLevelCalculator {
public:
    WaterLevelCalculator(float totalDepth = DEFAULT_TOTAL_DEPTH_CM);
    
    void setTotalDepth(float totalDepth);
    float getTotalDepth() const { return totalDepthCm; }

    WaterMetrics calculate(float distanceCm, bool validReading);

private:
    float totalDepthCm;

    // Rolling history for rate-of-rise calculation
    static const int HISTORY_SIZE = 10;
    struct HistoryPoint {
        float level;
        unsigned long timestamp;
    };
    HistoryPoint history[HISTORY_SIZE];
    int historyHead;
    int historyCount;

    float computeRateOfRise(float currentLevel, unsigned long now);
};

#endif // WATER_LEVEL_H
