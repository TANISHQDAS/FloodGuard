#include "WaterLevel.h"

WaterLevelCalculator::WaterLevelCalculator(float totalDepth) 
    : totalDepthCm(totalDepth), historyHead(0), historyCount(0) {
    for (int i = 0; i < HISTORY_SIZE; i++) {
        history[i].level = 0.0f;
        history[i].timestamp = 0;
    }
}

void WaterLevelCalculator::setTotalDepth(float totalDepth) {
    if (totalDepth > 5.0f && totalDepth <= 500.0f) {
        totalDepthCm = totalDepth;
    }
}

float WaterLevelCalculator::computeRateOfRise(float currentLevel, unsigned long now) {
    // Add current point to circular history buffer
    history[historyHead].level = currentLevel;
    history[historyHead].timestamp = now;
    historyHead = (historyHead + 1) % HISTORY_SIZE;
    if (historyCount < HISTORY_SIZE) {
        historyCount++;
    }

    // Need at least 2 points to compute slope
    if (historyCount < 2) {
        return 0.0f;
    }

    // Find the oldest point in the window that is around RATE_OF_RISE_WINDOW_MS ago
    int oldestIndex = (historyHead - historyCount + HISTORY_SIZE) % HISTORY_SIZE;
    float oldestLevel = history[oldestIndex].level;
    unsigned long oldestTime = history[oldestIndex].timestamp;

    unsigned long timeDiffMs = now - oldestTime;
    if (timeDiffMs < 2000) { // Require at least 2 seconds interval to avoid noise
        return 0.0f;
    }

    float deltaLevel = currentLevel - oldestLevel;
    float timeDiffMinutes = (float)timeDiffMs / 60000.0f;

    float rate = deltaLevel / timeDiffMinutes; // cm per minute
    return rate;
}

WaterMetrics WaterLevelCalculator::calculate(float distanceCm, bool validReading) {
    WaterMetrics metrics;
    unsigned long now = millis();

    if (!validReading || distanceCm <= 0.0f) {
        metrics.waterLevelCm = 0.0f;
        metrics.waterLevelPercent = 0.0f;
        metrics.rateOfRiseCmPerMin = 0.0f;
        metrics.isRapidRise = false;
        metrics.alertLevel = ALERT_ERROR;
        metrics.alertLevelStr = "SENSOR ERROR";
        return metrics;
    }

    // Water Level = Total Depth - Distance to water surface
    float calculatedLevel = totalDepthCm - distanceCm;

    // Bounds clamping
    if (calculatedLevel < 0.0f) {
        calculatedLevel = 0.0f;
    } else if (calculatedLevel > totalDepthCm) {
        calculatedLevel = totalDepthCm;
    }

    metrics.waterLevelCm = calculatedLevel;
    metrics.waterLevelPercent = (calculatedLevel / totalDepthCm) * 100.0f;

    // Rate-of-Rise computation
    metrics.rateOfRiseCmPerMin = computeRateOfRise(calculatedLevel, now);

    // Rapid Rise condition: Rate is positive and exceeds threshold, with minimum rise magnitude > 0.5 cm
    if (metrics.rateOfRiseCmPerMin >= RAPID_RISE_THRESHOLD_CM_PER_MIN) {
        metrics.isRapidRise = true;
    } else {
        metrics.isRapidRise = false;
    }

    // Warning Level Classification
    if (metrics.waterLevelPercent >= THRESHOLD_DANGER_PERCENT) {
        metrics.alertLevel = ALERT_DANGER;
        metrics.alertLevelStr = "DANGER";
    } else if (metrics.waterLevelPercent >= THRESHOLD_WARNING_PERCENT) {
        metrics.alertLevel = ALERT_WARNING;
        metrics.alertLevelStr = "WARNING";
    } else {
        metrics.alertLevel = ALERT_NORMAL;
        metrics.alertLevelStr = "NORMAL";
    }

    return metrics;
}
