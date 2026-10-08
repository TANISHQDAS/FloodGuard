'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Copy, Check, FileCode, Cpu, Globe, Terminal, ExternalLink } from 'lucide-react';

export default function SourceCodePage() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'firmware' | 'config' | 'sensors' | 'api' | 'circuit'>('firmware');

  const copyCode = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const files = {
    firmware: {
      name: 'floodguard_esp32.ino',
      path: 'firmware/floodguard_esp32/floodguard_esp32.ino',
      lang: 'cpp',
      code: `/**
 * Project: FloodGuard - Smart River Water Level Monitoring & Early Warning
 * Developers: Tanishq Das (Reg: 23BAI10587) and Abhi Pandey (Reg: 23BAI10909)
 * Academic Program: 4th Year, VIT Bhopal University
 * License: CERN Open Hardware Licence Version 2 (CERN-OHL-S)
 */

#include "Config.h"
#include "Sensors.h"
#include "WaterLevel.h"
#include "AlertManager.h"
#include "DisplayManager.h"
#include "NetworkManager.h"

Sensors sensors;
WaterLevelCalculator calculator(DEFAULT_TOTAL_DEPTH_CM);
AlertManager alertManager;
DisplayManager displayManager;
NetworkManager networkManager;

unsigned long lastSensorReadTime = 0;
unsigned long lastTelemetryTime  = 0;

SensorReadings currentSensors;
WaterMetrics   currentMetrics;

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println("==================================================");
    Serial.println(" FloodGuard - Smart River Water Level Monitor     ");
    Serial.println(" Tanishq Das (23BAI10587) | Abhi Pandey (23BAI10909)");
    Serial.println(" 4th Year B.Tech | VIT Bhopal University          ");
    Serial.println("==================================================");

    alertManager.init();
    sensors.init();
    displayManager.init();
    networkManager.init(WIFI_SSID_DEFAULT, WIFI_PASSWORD_DEFAULT);
}

void loop() {
    unsigned long now = millis();
    networkManager.update();

    if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL_MS) {
        lastSensorReadTime = now;
        currentSensors = sensors.readAll();
        currentMetrics = calculator.calculate(currentSensors.rawDistanceCm, currentSensors.distanceValid);
        networkManager.cacheLatestReadings(currentSensors, currentMetrics);
        displayManager.update(currentSensors, currentMetrics, networkManager.isConnected());
    }

    alertManager.update(currentMetrics.alertLevel, currentMetrics.isRapidRise);

    if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
        lastTelemetryTime = now;
        networkManager.sendTelemetry(currentSensors, currentMetrics);
    }
}`
    },
    config: {
      name: 'Config.h',
      path: 'firmware/floodguard_esp32/Config.h',
      lang: 'cpp',
      code: `// Pin Assignments & Calibration Constants
const uint8_t PIN_TRIG = 5;
const uint8_t PIN_ECHO = 18; // Via 1k/2k voltage divider to 3.3V
const uint8_t PIN_RAIN_ANALOG  = 34; // ADC1_CH6 (Safe with WiFi)
const uint8_t PIN_RAIN_DIGITAL = 19;
const uint8_t PIN_LED_GREEN  = 25;
const uint8_t PIN_LED_YELLOW = 26;
const uint8_t PIN_LED_RED    = 27;
const uint8_t PIN_BUZZER     = 14;
const uint8_t PIN_OLED_SDA   = 21;
const uint8_t PIN_OLED_SCL   = 22;

const float DEFAULT_TOTAL_DEPTH_CM = 50.0f;
const float THRESHOLD_WARNING_PERCENT = 60.0f;
const float THRESHOLD_DANGER_PERCENT  = 85.0f;
const float RAPID_RISE_THRESHOLD_CM_PER_MIN = 5.0f;

#define BACKEND_SERVER_URL "https://floodguard-live.vercel.app/api/telemetry"
#define DEVICE_ID          "FG-NODE-01"`
    },
    sensors: {
      name: 'Sensors.cpp',
      path: 'firmware/floodguard_esp32/Sensors.cpp',
      lang: 'cpp',
      code: `// Outlier-Resistant 5-Sample Median Filter
float Sensors::readUltrasonicFiltered() {
    float validSamples[5];
    int validCount = 0;

    for (int i = 0; i < 5; i++) {
        float r = readUltrasonicRaw();
        if (r > 2.0f && r < 400.0f) {
            validSamples[validCount++] = r;
        }
        delay(15);
    }

    if (validCount < 2) return -1.0f;

    for (int i = 0; i < validCount - 1; i++) {
        for (int j = i + 1; j < validCount; j++) {
            if (validSamples[i] > validSamples[j]) {
                float tmp = validSamples[i];
                validSamples[i] = validSamples[j];
                validSamples[j] = tmp;
            }
        }
    }
    return validSamples[validCount / 2];
}`
    },
    api: {
      name: 'route.ts (Telemetry API)',
      path: 'src/app/api/telemetry/route.ts',
      lang: 'typescript',
      code: `import { NextRequest, NextResponse } from 'next/server';
import { recordTelemetryReading } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reading, alertCreated } = recordTelemetryReading({
    stationId: body.device_id || 'FG-NODE-01',
    timestamp: new Date().toISOString(),
    distanceCm: body.distance_cm,
    waterLevelCm: body.water_level_cm,
    waterLevelPercent: body.water_level_percent,
    rateOfRiseCmPerMin: body.rate_of_rise,
    isRapidRise: body.is_rapid_rise,
    rainStatus: body.rain_status,
    rainAnalogValue: body.rain_analog,
    alertLevel: body.alert_level,
    sensorError: body.sensor_error,
  });

  return NextResponse.json({ success: true, reading, alertCreated });
}`
    },
    circuit: {
      name: 'CIRCUIT_DIAGRAM.md',
      path: 'hardware/CIRCUIT_DIAGRAM.md',
      lang: 'markdown',
      code: `HC-SR04 ECHO Pin (5V Out)
      |
      +-----[ 1.0k ohm Resistor (R1) ]----+ (To ESP32 GPIO 18, 3.33V)
                                          |
                                          +-----[ 2.0k ohm Resistor (R2) ]---> GND

ESP32 GPIO Pinouts:
- GPIO 05 -> HC-SR04 TRIG
- GPIO 18 -> HC-SR04 ECHO (Via 1k/2k Voltage Divider)
- GPIO 34 -> Rain Sensor AO (ADC1_CH6)
- GPIO 19 -> Rain Sensor DO
- GPIO 21 / 22 -> SSD1306 OLED SDA / SCL
- GPIO 25, 26, 27 -> Green, Yellow, Red LEDs (via 330 ohm)
- GPIO 14 -> Active Piezo Siren Alarm`
    }
  };

  const current = files[activeTab];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/report"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <span>IEEE Project Report</span>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow"
            >
              <span>Interactive Demo Video</span>
            </Link>
          </div>
        </div>

        {/* Title */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-9 w-9 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white font-sans">FloodGuard Source Code & Firmware Architecture</h1>
              <p className="text-xs text-slate-400">
                Developed by <strong className="text-slate-200">Tanishq Das</strong> (Reg. No: 23BAI10587) and <strong className="text-slate-200">Abhi Pandey</strong> (Reg. No: 23BAI10909) &bull; 4th Year B.Tech, VIT Bhopal University
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Open-hardware ESP32 firmware modules, calibrated sensor signal filters, and Next.js serverless route handlers licensed under CERN-OHL-S.
          </p>
        </div>

        {/* File Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
          {Object.entries(files).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>

        {/* Code Viewer */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#0d131f] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">{current.path}</span>
            <button
              onClick={() => copyCode(current.name, current.code)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-sans transition-colors"
            >
              {copiedFile === current.name ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 bg-[#090d16] leading-relaxed max-h-[550px]">
            <code>{current.code}</code>
          </pre>
        </div>

      </div>
    </div>
  );
}
