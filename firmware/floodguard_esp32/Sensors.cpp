#include "Sensors.h"

Sensors::Sensors() : consecutiveFailures(0) {
    for (int i = 0; i < SAMPLES; i++) {
        sampleBuffer[i] = 0.0f;
    }
}

void Sensors::init() {
    pinMode(PIN_TRIG, OUTPUT);
    pinMode(PIN_ECHO, INPUT);
    digitalWrite(PIN_TRIG, LOW);

    pinMode(PIN_RAIN_ANALOG, INPUT);
    pinMode(PIN_RAIN_DIGITAL, INPUT);

    // Warm-up sensor reading
    readUltrasonicRaw();
}

float Sensors::readUltrasonicRaw() {
    // Ensure clean LOW pulse before triggering
    digitalWrite(PIN_TRIG, LOW);
    delayMicroseconds(4);
    
    // 10 microsecond HIGH pulse to trigger ultrasonic burst
    digitalWrite(PIN_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_TRIG, LOW);

    // Measure echo pulse width. Timeout at 25000us (~430cm max range)
    unsigned long duration = pulseIn(PIN_ECHO, HIGH, 25000);

    if (duration == 0) {
        return -1.0f; // Timeout or sensor disconnected
    }

    // Speed of sound in dry air at 20°C is ~343 m/s = 0.0343 cm/microsecond
    // Distance = (duration / 2) * 0.0343
    float distance = (duration * 0.0343f) / 2.0f;

    // Check physical validity limits
    if (distance < SENSOR_MIN_DISTANCE_CM || distance > SENSOR_MAX_DISTANCE_CM) {
        return -1.0f;
    }

    return distance;
}

float Sensors::readUltrasonicFiltered() {
    float validSamples[SAMPLES];
    int validCount = 0;

    // Take multiple rapid samples with short settling delays
    for (int i = 0; i < SAMPLES; i++) {
        float r = readUltrasonicRaw();
        if (r > 0.0f) {
            validSamples[validCount++] = r;
        }
        delay(15); // Sensor recovery time
    }

    // If more than half the samples failed, count failure
    if (validCount < 2) {
        consecutiveFailures++;
        return -1.0f;
    }

    // Reset failure counter on valid readings
    consecutiveFailures = 0;

    // Sort valid samples to extract median
    for (int i = 0; i < validCount - 1; i++) {
        for (int j = i + 1; j < validCount; j++) {
            if (validSamples[i] > validSamples[j]) {
                float tmp = validSamples[i];
                validSamples[i] = validSamples[j];
                validSamples[j] = tmp;
            }
        }
    }

    // Return median
    return validSamples[validCount / 2];
}

RainStatus Sensors::evaluateRain(int analogVal, bool digitalVal) {
    // Note: Rain sensor analog drops as moisture increases
    if (analogVal < RAIN_LIGHT_THRESHOLD || digitalVal == LOW) {
        if (analogVal < 1200) {
            return RAIN_HEAVY;
        }
        return RAIN_LIGHT;
    }
    return RAIN_NONE;
}

SensorReadings Sensors::readAll() {
    SensorReadings readings;
    readings.errorMessage = "";

    // 1. Read Ultrasonic Distance
    readings.rawDistanceCm = readUltrasonicFiltered();

    if (readings.rawDistanceCm <= 0.0f || consecutiveFailures >= 3) {
        readings.distanceValid = false;
        readings.sensorError = true;
        readings.errorMessage = "Ultrasonic Error (Out of Range / Disconnected)";
    } else {
        readings.distanceValid = true;
        readings.sensorError = false;
    }

    // 2. Read Rain Sensor
    readings.rainRawAnalog = analogRead(PIN_RAIN_ANALOG);
    readings.rainDigitalActive = (digitalRead(PIN_RAIN_DIGITAL) == LOW); // Active LOW on LM393 comparator board
    readings.rainStatus = evaluateRain(readings.rainRawAnalog, readings.rainDigitalActive);

    switch (readings.rainStatus) {
        case RAIN_HEAVY:
            readings.rainStatusStr = "Heavy Rain";
            break;
        case RAIN_LIGHT:
            readings.rainStatusStr = "Light Rain";
            break;
        default:
            readings.rainStatusStr = "No Rain";
            break;
    }

    return readings;
}
