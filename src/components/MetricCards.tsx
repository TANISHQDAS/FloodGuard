'use client';

import React from 'react';
import { TelemetryReading, MonitoringStation } from '@/lib/types';
import { Waves, TrendingUp, TrendingDown, Minus, CloudRain, ShieldCheck, AlertTriangle, AlertOctagon, Gauge, Activity } from 'lucide-react';

interface MetricCardsProps {
  station: MonitoringStation;
  reading: TelemetryReading;
}

export function MetricCards({ station, reading }: MetricCardsProps) {
  const isDanger = reading.alertLevel === 'DANGER';
  const isWarning = reading.alertLevel === 'WARNING';
  const isRapid = reading.isRapidRise;

  const warningCm = (station.warningThresholdPercent / 100) * station.totalDepthCm;
  const dangerCm = (station.dangerThresholdPercent / 100) * station.totalDepthCm;
  const freeboardMargin = Math.max(0, station.totalDepthCm - reading.waterLevelCm);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* 1. Water Level / River Stage */}
      <div className={`p-4 rounded-lg border bg-[#111827] shadow-sm flex flex-col justify-between ${
        isDanger ? 'border-rose-700/80' : isWarning || isRapid ? 'border-amber-600/70' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wide uppercase text-slate-400 flex items-center space-x-1.5">
              <Waves className="h-3.5 w-3.5 text-blue-400" />
              <span>River Stage Elevation</span>
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {Math.round(reading.waterLevelPercent)}% Cap
            </span>
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
              {reading.waterLevelCm.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400 font-mono">cm</span>
          </div>

          {/* Stepped gauge bar with threshold notches */}
          <div className="mt-3 relative">
            <div className="w-full bg-slate-800/90 h-2 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isDanger ? 'bg-rose-500' : isWarning || isRapid ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, reading.waterLevelPercent))}%` }}
              />
            </div>
            {/* Warning notch at warningThresholdPercent */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none"
              style={{ left: `${station.warningThresholdPercent}%` }}
              title={`Warning: ${station.warningThresholdPercent}%`}
            />
            {/* Danger notch at dangerThresholdPercent */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none"
              style={{ left: `${station.dangerThresholdPercent}%` }}
              title={`Danger: ${station.dangerThresholdPercent}%`}
            />
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Air Gap: <strong className="text-slate-300">{reading.distanceCm.toFixed(1)}cm</strong></span>
          <span>Freeboard: <strong className="text-slate-300">{freeboardMargin.toFixed(1)}cm</strong></span>
        </div>
      </div>

      {/* 2. Rate of Rise (Derivative Velocity) */}
      <div className={`p-4 rounded-lg border bg-[#111827] shadow-sm flex flex-col justify-between ${
        isRapid ? 'border-amber-600/80 bg-amber-950/15' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wide uppercase text-slate-400 flex items-center space-x-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              <span>Surge Slope (dh/dt)</span>
            </span>
            {reading.rateOfRiseCmPerMin > 0.3 ? (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 flex items-center space-x-0.5">
                <TrendingUp className="h-3 w-3" />
                <span>RISING</span>
              </span>
            ) : reading.rateOfRiseCmPerMin < -0.3 ? (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80 flex items-center space-x-0.5">
                <TrendingDown className="h-3 w-3" />
                <span>RECEDING</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center space-x-0.5">
                <Minus className="h-3 w-3" />
                <span>STABLE</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className={`text-3xl font-extrabold tracking-tight font-mono tabular-nums ${
              reading.rateOfRiseCmPerMin >= station.rapidRiseThreshold
                ? 'text-amber-400'
                : 'text-white'
            }`}>
              {reading.rateOfRiseCmPerMin >= 0 ? `+${reading.rateOfRiseCmPerMin.toFixed(1)}` : reading.rateOfRiseCmPerMin.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400 font-mono">cm/min</span>
          </div>

          <div className="mt-2.5">
            {isRapid ? (
              <span className="inline-block text-[11px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/80">
                CRITICAL RAPID SURGE DETECTED
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">
                {reading.rateOfRiseCmPerMin > 1.0 ? 'Accelerated catchment runoff' : 'Normal channel discharge'}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Surge Limit: <strong className="text-slate-300">{station.rapidRiseThreshold.toFixed(1)} cm/min</strong></span>
          <span>Sampling: <strong className="text-slate-300">2.0s</strong></span>
        </div>
      </div>

      {/* 3. Catchment Rainfall Sensor */}
      <div className="p-4 rounded-lg border border-slate-800 bg-[#111827] shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wide uppercase text-slate-400 flex items-center space-x-1.5">
              <CloudRain className="h-3.5 w-3.5 text-blue-400" />
              <span>Catchment Precipitation</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              ADC: {reading.rainAnalogValue}
            </span>
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {reading.rainStatus}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-sans leading-relaxed">
            {reading.rainStatus === 'Heavy Rain'
              ? 'Intense precipitation. Immediate flash runoff expected.'
              : reading.rainStatus === 'Moderate Rain'
              ? 'Steady rain detected across watershed.'
              : reading.rainStatus === 'Light Rain'
              ? 'Light precipitation detected on sensor plate.'
              : 'Catchment currently dry; no active precipitation.'}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Interface: <strong className="text-slate-300">FC-37 Rain Grid</strong></span>
          <span>ADC Pin: <strong className="text-slate-300">GPIO 34</strong></span>
        </div>
      </div>

      {/* 4. Hydrological Alert Tier */}
      <div className={`p-4 rounded-lg border bg-[#111827] shadow-sm flex flex-col justify-between ${
        isDanger
          ? 'border-rose-600 bg-rose-950/25'
          : isWarning || isRapid
          ? 'border-amber-600 bg-amber-950/25'
          : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wide uppercase text-slate-400 flex items-center space-x-1.5">
              <Gauge className="h-3.5 w-3.5 text-blue-400" />
              <span>Basin Warning Tier</span>
            </span>
            {isDanger ? (
              <AlertOctagon className="h-4 w-4 text-rose-400" />
            ) : isWarning || isRapid ? (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold font-mono tracking-wider ${
              isDanger
                ? 'text-rose-400'
                : isWarning || isRapid
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {reading.alertLevel}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 mt-2 font-sans leading-relaxed">
            {isDanger
              ? 'Critical overflow threat. Acoustic sirens active; initiate community evacuation.'
              : isWarning || isRapid
              ? 'Water approaching flood threshold or rising steeply. Maintain vigilance.'
              : 'Water level nominal and below warning threshold. River flow safe.'}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Siren Mode: <strong className={isDanger ? 'text-rose-400' : 'text-slate-300'}>{isDanger ? 'ACTIVE (85dB)' : 'STANDBY'}</strong></span>
          <span>LED: <strong className={isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>{reading.alertLevel}</strong></span>
        </div>
      </div>

    </div>
  );
}
