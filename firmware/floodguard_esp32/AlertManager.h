#ifndef ALERT_MANAGER_H
#define ALERT_MANAGER_H

#include <Arduino.h>
#include "Config.h"
#include "WaterLevel.h"

class AlertManager {
public:
    AlertManager();
    void init();
    void update(AlertLevel level, bool isRapidRise);
    void silenceBuzzer(bool silence);

private:
    bool buzzerSilenced;
    unsigned long lastBuzzerToggleTime;
    bool buzzerState;
    unsigned long lastLedBlinkTime;
    bool blinkState;

    void handleNormal();
    void handleWarning(bool isRapidRise);
    void handleDanger();
    void handleError();
};

#endif // ALERT_MANAGER_H
