#include "AlertManager.h"

AlertManager::AlertManager() 
    : buzzerSilenced(false), lastBuzzerToggleTime(0), buzzerState(false),
      lastLedBlinkTime(0), blinkState(false) {}

void AlertManager::init() {
    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_YELLOW, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);

    // Initial state: turn off all
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);

    // Self-test startup sequence: cycle through LEDs and quick beep
    digitalWrite(PIN_LED_GREEN, HIGH);
    delay(150);
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, HIGH);
    delay(150);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_BUZZER, HIGH);
    delay(150);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
}

void AlertManager::silenceBuzzer(bool silence) {
    buzzerSilenced = silence;
    if (silence) {
        digitalWrite(PIN_BUZZER, LOW);
    }
}

void AlertManager::handleNormal() {
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    buzzerState = false;
}

void AlertManager::handleWarning(bool isRapidRise) {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    
    unsigned long now = millis();

    if (isRapidRise) {
        // Rapid rise priority: Rapidly flash Yellow LED and pulse warning chirp
        if (now - lastLedBlinkTime > 250) {
            lastLedBlinkTime = now;
            blinkState = !blinkState;
            digitalWrite(PIN_LED_YELLOW, blinkState ? HIGH : LOW);
        }

        if (!buzzerSilenced) {
            // Short intermittent beep every 1.5s
            if (now - lastBuzzerToggleTime > 1500) {
                lastBuzzerToggleTime = now;
                digitalWrite(PIN_BUZZER, HIGH);
                delay(40); // brief chirp
                digitalWrite(PIN_BUZZER, LOW);
            }
        }
    } else {
        // Standard Warning: Solid Yellow LED, silent buzzer
        digitalWrite(PIN_LED_YELLOW, HIGH);
        digitalWrite(PIN_BUZZER, LOW);
    }
}

void AlertManager::handleDanger() {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    
    unsigned long now = millis();

    // Red LED fast blinking to signal severe threat
    if (now - lastLedBlinkTime > 200) {
        lastLedBlinkTime = now;
        blinkState = !blinkState;
        digitalWrite(PIN_LED_RED, blinkState ? HIGH : LOW);
    }

    // Buzzer pulsed alarm: 400ms ON / 200ms OFF
    if (!buzzerSilenced) {
        if (buzzerState && (now - lastBuzzerToggleTime >= 400)) {
            buzzerState = false;
            lastBuzzerToggleTime = now;
            digitalWrite(PIN_BUZZER, LOW);
        } else if (!buzzerState && (now - lastBuzzerToggleTime >= 200)) {
            buzzerState = true;
            lastBuzzerToggleTime = now;
            digitalWrite(PIN_BUZZER, HIGH);
        }
    } else {
        digitalWrite(PIN_BUZZER, LOW);
    }
}

void AlertManager::handleError() {
    unsigned long now = millis();
    // In error state, alternate Yellow and Red LEDs, turn off Green and Buzzer
    if (now - lastLedBlinkTime > 500) {
        lastLedBlinkTime = now;
        blinkState = !blinkState;
        digitalWrite(PIN_LED_GREEN, LOW);
        digitalWrite(PIN_LED_YELLOW, blinkState ? HIGH : LOW);
        digitalWrite(PIN_LED_RED, blinkState ? LOW : HIGH);
    }
    digitalWrite(PIN_BUZZER, LOW);
}

void AlertManager::update(AlertLevel level, bool isRapidRise) {
    switch (level) {
        case ALERT_NORMAL:
            if (isRapidRise) {
                // If water is at normal level but rising rapidly, elevate visual alert!
                handleWarning(true);
            } else {
                handleNormal();
            }
            break;

        case ALERT_WARNING:
            handleWarning(isRapidRise);
            break;

        case ALERT_DANGER:
            handleDanger();
            break;

        case ALERT_ERROR:
        default:
            handleError();
            break;
    }
}
