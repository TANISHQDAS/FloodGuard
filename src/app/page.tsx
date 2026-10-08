'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MonitoringStation, TelemetryReading, AlertLogItem, EvacuationZone } from '@/lib/types';
import { Header } from '@/components/Header';
import { StationSelector } from '@/components/StationSelector';
import { MetricCards } from '@/components/MetricCards';
import { TelemetryChart } from '@/components/TelemetryChart';
import { RiverTankCrossSection } from '@/components/RiverTankCrossSection';
import { PredictiveModelPanel } from '@/components/PredictiveModelPanel';
import { EvacuationMapPanel } from '@/components/EvacuationMapPanel';
import { AlertLogTable } from '@/components/AlertLogTable';
import { StationConfigPanel } from '@/components/StationConfigPanel';
import { AlertTriangle, AlertOctagon, Zap, Shield, Radio, RefreshCw, Terminal, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('FG-NODE-01');
  const [history, setHistory] = useState<TelemetryReading[]>([]);
  const [alerts, setAlerts] = useState<AlertLogItem[]>([]);
  const [zones, setZones] = useState<EvacuationZone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [buzzerEnabled, setBuzzerEnabled] = useState<boolean>(false);

  // Audio Context ref for Web Audio Buzzer synthesis
  const audioContextRef = useRef<AudioContext | null>(null);

  // Selected station lookup
  const activeStation = stations.find((st) => st.id === selectedStationId) || stations[0];
  const activeReading = activeStation?.currentReading;

  // Initial load and periodic polling
  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 3000);
    return () => clearInterval(interval);
  }, [selectedStationId]);

  // Audio tone synthesizer function (2.4 kHz piezoelectric tone emulator)
  const playBuzzerTone = (freq = 2400, duration = 0.2) => {
    if (!buzzerEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.error('Audio playback error', err);
    }
  };

  // Sound buzzer alarm if active reading is in DANGER or RAPID RISE
  useEffect(() => {
    if (!buzzerEnabled || !activeReading) return;
    if (activeReading.alertLevel === 'DANGER') {
      playBuzzerTone(2600, 0.35);
    } else if (activeReading.isRapidRise) {
      playBuzzerTone(2200, 0.15);
    }
  }, [activeReading?.waterLevelCm, buzzerEnabled]);

  const loadAllData = async () => {
    try {
      // 1. Fetch stations
      const stRes = await fetch('/api/stations');
      const stData = await stRes.json();
      if (stData.stations) {
        setStations(stData.stations);
      }

      // 2. Fetch telemetry history for selected station
      const telRes = await fetch(`/api/telemetry?stationId=${selectedStationId}`);
      const telData = await telRes.json();
      if (telData.history) {
        setHistory(telData.history);
      }

      // 3. Fetch alerts
      const altRes = await fetch('/api/alerts');
      const altData = await altRes.json();
      if (altData.alerts) {
        setAlerts(altData.alerts);
      }

      // 4. Fetch evacuation zones
      const zoneRes = await fetch('/api/evacuation');
      const zoneData = await zoneRes.json();
      if (zoneData.zones) {
        setZones(zoneData.zones);
      }
    } catch (e) {
      console.error('Error fetching dashboard telemetry', e);
    } finally {
      setLoading(false);
    }
  };

  // Simulation loop trigger
  useEffect(() => {
    if (!isSimulating) return;

    let simStep = 0;
    const simInterval = setInterval(async () => {
      simStep++;
      if (!activeStation) return;

      const totalDepth = activeStation.totalDepthCm;
      // Cycle: Dry Baseflow -> Rain Inflow -> Wave Surge -> Flood Danger -> Channel Recession
      const cycle = simStep % 40;
      let newLevel = activeStation.currentReading.waterLevelCm;
      let rain: any = 'No Rain';
      let analog = 3800;

      if (cycle < 8) {
        newLevel = Math.max(8.0, 10.0 + Math.sin(simStep * 0.3) * 1.5);
        rain = 'No Rain';
      } else if (cycle < 16) {
        newLevel += 1.2;
        rain = 'Light Rain';
        analog = 2400;
      } else if (cycle < 26) {
        newLevel += 2.8; // Steep rapid rise
        rain = 'Heavy Rain';
        analog = 1100;
      } else if (cycle < 32) {
        newLevel = Math.min(totalDepth * 0.92, newLevel + 0.5); // Danger peak
        rain = 'Heavy Rain';
        analog = 950;
      } else {
        newLevel = Math.max(10.0, newLevel - 3.2); // Recession
        rain = 'Light Rain';
        analog = 2900;
      }

      newLevel = Math.max(2, Math.min(totalDepth, newLevel));
      const pct = (newLevel / totalDepth) * 100;
      const rateOfRise = parseFloat(((newLevel - activeStation.currentReading.waterLevelCm) * 15).toFixed(1));
      const isRapid = rateOfRise >= activeStation.rapidRiseThreshold;

      let alertLevel: any = 'NORMAL';
      if (pct >= activeStation.dangerThresholdPercent) alertLevel = 'DANGER';
      else if (pct >= activeStation.warningThresholdPercent || isRapid) alertLevel = 'WARNING';

      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: activeStation.id,
          distance_cm: parseFloat((totalDepth - newLevel).toFixed(1)),
          water_level_cm: parseFloat(newLevel.toFixed(1)),
          water_level_percent: parseFloat(pct.toFixed(1)),
          rate_of_rise: rateOfRise,
          is_rapid_rise: isRapid,
          rain_status: rain,
          rain_analog: analog,
          alert_level: alertLevel,
          sensor_error: false,
        }),
      });

      loadAllData();
    }, 2000);

    return () => clearInterval(simInterval);
  }, [isSimulating, activeStation]);

  // Flash Surge Injection action
  const handleInjectSurge = async () => {
    if (!activeStation) return;
    const totalDepth = activeStation.totalDepthCm;
    const current = activeStation.currentReading.waterLevelCm;
    const surged = Math.min(totalDepth * 0.88, current + 15.0);
    const pct = (surged / totalDepth) * 100;

    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: activeStation.id,
        distance_cm: parseFloat((totalDepth - surged).toFixed(1)),
        water_level_cm: parseFloat(surged.toFixed(1)),
        water_level_percent: parseFloat(pct.toFixed(1)),
        rate_of_rise: 14.5,
        is_rapid_rise: true,
        rain_status: 'Heavy Rain',
        rain_analog: 1200,
        alert_level: pct >= activeStation.dangerThresholdPercent ? 'DANGER' : 'WARNING',
        sensor_error: false,
      }),
    });
    loadAllData();
  };

  // Station Configuration update
  const handleUpdateConfig = async (updated: Partial<MonitoringStation>) => {
    if (!activeStation) return;
    const res = await fetch('/api/stations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: activeStation.id, ...updated }),
    });
    if (res.ok) {
      loadAllData();
    }
  };

  // Alert acknowledgement action
  const handleAcknowledgeAlert = async (id: string) => {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId: id }),
    });
    loadAllData();
  };

  const criticalAlerts = alerts.filter((a) => !a.acknowledged && (a.severity === 'critical' || a.severity === 'high'));

  if (loading && stations.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
        <p className="text-xs font-mono">Initializing connection to catchment telemetry nodes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col">
      {/* Top Header */}
      <Header
        activeStationCount={stations.length}
        criticalAlertCount={criticalAlerts.length}
        lastPingTime={activeReading?.timestamp || ''}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
      />

      {/* Rapid Rise Alert Banner */}
      {activeReading?.isRapidRise && (
        <div className="bg-amber-950/90 border-y border-amber-600/80 px-4 py-2 text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-2 font-bold font-mono">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>EARLY WARNING: RAPID STAGE RISE DETECTED ON {activeStation.id}</span>
              <span className="text-amber-300 font-semibold">
                (+{activeReading.rateOfRiseCmPerMin.toFixed(1)} cm/min slope)
              </span>
            </div>
            <span className="text-[11px] font-mono bg-amber-900/90 px-2 py-0.5 rounded border border-amber-700">
              STAGE ELEVATION APPROACHING CRITICAL THRESHOLD
            </span>
          </div>
        </div>
      )}

      {/* Critical Danger Alert Banner */}
      {activeReading?.alertLevel === 'DANGER' && (
        <div className="bg-rose-950 border-y border-rose-600 px-4 py-2.5 text-rose-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-2 font-bold font-mono">
              <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
              <span>CRITICAL FLOOD STAGE EXCEEDED ON {activeStation.name}</span>
              <span className="text-white font-bold">
                [{activeReading.waterLevelCm.toFixed(1)} cm / {Math.round(activeReading.waterLevelPercent)}% capacity]
              </span>
            </div>
            <span className="text-[11px] font-mono bg-rose-900 px-2.5 py-0.5 rounded border border-rose-700 font-bold uppercase tracking-wider">
              ACOUSTIC SIREN & EVACUATION CORRIDOR DISPATCH ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* Main Telemetry & Control Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-5 space-y-4 flex-1">
        
        {/* Monitoring Station Nodes */}
        <StationSelector
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={setSelectedStationId}
        />

        {/* Current Station Metrics */}
        {activeStation && activeReading && (
          <MetricCards station={activeStation} reading={activeReading} />
        )}

        {/* Real-time Hydrograph & Acoustic Sounding Cross-Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {activeStation && (
              <TelemetryChart history={history} station={activeStation} />
            )}
          </div>
          <div>
            {activeStation && activeReading && (
              <RiverTankCrossSection station={activeStation} reading={activeReading} />
            )}
          </div>
        </div>

        {/* Hydrological Bench Simulation Controller */}
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 flex items-center space-x-1.5 uppercase tracking-wide">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              <span>Hydrological Simulation & Bench Testing Controller</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inject synthetic catchment storm runoff or run cyclic hydrograph transitions to evaluate early warnings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInjectSurge}
              className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Zap className="h-3 w-3" />
              <span>Inject Flash Runoff (+15cm)</span>
            </button>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold border transition-colors ${
                isSimulating
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
            >
              {isSimulating ? 'Stop Auto Hydrograph' : 'Start Multi-Stage Cycle'}
            </button>
          </div>
        </div>

        {/* Hydrological Runoff & Crest Arrival Forecast */}
        {activeReading && (
          <PredictiveModelPanel
            stationId={selectedStationId}
            waterLevelPercent={activeReading.waterLevelPercent}
            rateOfRise={activeReading.rateOfRiseCmPerMin}
            rainStatus={activeReading.rainStatus}
          />
        )}

        {/* Evacuation Zones & Route Mapping */}
        <EvacuationMapPanel zones={zones} />

        {/* Alerts Audit Log Table */}
        <AlertLogTable alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />

        {/* Station Calibration Settings & Telemetry Exporter */}
        {activeStation && (
          <StationConfigPanel
            station={activeStation}
            onUpdateConfig={handleUpdateConfig}
            buzzerEnabled={buzzerEnabled}
            onToggleBuzzer={() => setBuzzerEnabled(!buzzerEnabled)}
          />
        )}

      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-slate-800 bg-[#0d131f] py-4 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            <span className="text-slate-200 font-semibold">FloodGuard Open Hardware Project</span> • Developed by{' '}
            <strong className="text-white">Tanishq Das</strong> (23BAI10587) &{' '}
            <strong className="text-white">Abhi Pandey</strong> (23BAI10909) • 4th Year B.Tech, VIT Bhopal University
          </div>
          <div className="text-slate-500">
            CERN-OHL-S Licence • ESP32 Ingestion: <code className="text-slate-400">/api/telemetry</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
