#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include "Config.h"

enum RainStatus {
    RAIN_NONE = 0,
    RAIN_LIGHT = 1,
    RAIN_HEAVY = 2
};

struct SensorReadings {
    float rawDistanceCm;     // Filtered distance from sensor to water surface
    bool distanceValid;       // True if ultrasonic reading is within physical limits
    int rainRawAnalog;        // 0-4095 ADC value
    bool rainDigitalActive;   // True if comparator threshold tripped
    RainStatus rainStatus;    // Categorized rain level
    const char* rainStatusStr;// Human readable string
    bool sensorError;         // True if sensor is disconnected or out-of-range
    const char* errorMessage; // Explanation if sensorError is true
};

class Sensors {
public:
    Sensors();
    void init();
    SensorReadings readAll();

private:
    float readUltrasonicRaw();
    float readUltrasonicFiltered();
    RainStatus evaluateRain(int analogVal, bool digitalVal);
    
    // Outlier rejection history
    static const int SAMPLES = 5;
    float sampleBuffer[SAMPLES];
    int consecutiveFailures;
};

#endif // SENSORS_H
