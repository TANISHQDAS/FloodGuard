'use client';

import React from 'react';
import { TelemetryReading, MonitoringStation } from '@/lib/types';
import { Waves, TrendingUp, CloudRain, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface MetricCardsProps {
  station: MonitoringStation;
  reading: TelemetryReading;
}

export function MetricCards({ station, reading }: MetricCardsProps) {
  // Alert styles calculation
  const isDanger = reading.alertLevel === 'DANGER';
  const isWarning = reading.alertLevel === 'WARNING';
  const isRapid = reading.isRapidRise;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Water Level Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Water Level</span>
          <Waves className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">
            {reading.waterLevelCm.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-slate-400">cm</span>
          <span className="text-xs ml-auto px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
            {Math.round(reading.waterLevelPercent)}% cap
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isDanger ? 'bg-rose-500' : isWarning || isRapid ? 'bg-amber-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, reading.waterLevelPercent))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-mono">
          <span>Air Gap: {reading.distanceCm.toFixed(1)}cm</span>
          <span>Max: {station.totalDepthCm}cm</span>
        </div>
      </div>

      {/* 2. Rate of Rise Card */}
      <div className={`bg-slate-900 border rounded-xl p-4 shadow-sm transition-colors ${
        isRapid ? 'border-amber-600/80 bg-amber-950/20' : 'border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Rate of Rise (Slope)</span>
          <TrendingUp className={`h-4 w-4 ${reading.rateOfRiseCmPerMin > 2 ? 'text-amber-400' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-extrabold ${reading.rateOfRiseCmPerMin > 3 ? 'text-amber-400' : 'text-white'}`}>
            {reading.rateOfRiseCmPerMin >= 0 ? `+${reading.rateOfRiseCmPerMin.toFixed(1)}` : reading.rateOfRiseCmPerMin.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-slate-400">cm/min</span>
        </div>
        <div className="mt-2.5 flex items-center space-x-1.5">
          {isRapid ? (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-semibold animate-pulse">
              Rapid Surge Triggered
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              {reading.rateOfRiseCmPerMin > 0.5 ? 'Moderate Inflow' : 'Hydrologically Stable'}
            </span>
          )}
        </div>
      </div>

      {/* 3. Precipitation / Rain Sensor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Catchment Rainfall</span>
          <CloudRain className="h-4 w-4 text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white">
            {reading.rainStatus}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          Sensor ADC: <span className="text-slate-300">{reading.rainAnalogValue}</span> (0-4095)
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {reading.rainStatus === 'Heavy Rain'
            ? 'Intense runoff entering stream'
            : reading.rainStatus === 'Moderate Rain' || reading.rainStatus === 'Light Rain'
            ? 'Surface moisture detected'
            : 'Dry catchment conditions'}
        </p>
      </div>

      {/* 4. Threat Status Tier */}
      <div className={`bg-slate-900 border rounded-xl p-4 shadow-sm transition-all ${
        isDanger
          ? 'border-rose-600 bg-rose-950/30'
          : isWarning || isRapid
          ? 'border-amber-600 bg-amber-950/30'
          : 'border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Safety Status</span>
          {isDanger ? (
            <AlertOctagon className="h-4 w-4 text-rose-500 animate-bounce" />
          ) : isWarning || isRapid ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-black tracking-wide ${
            isDanger ? 'text-rose-400' : isWarning || isRapid ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {reading.alertLevel}
          </span>
        </div>
        <p className="text-xs mt-2 text-slate-300 font-medium">
          {isDanger
            ? 'Immediate Evacuation Protocol'
            : isWarning || isRapid
            ? 'Monitoring Active: Yellow Stage'
            : 'Normal: Level below warning mark'}
        </p>
      </div>

    </div>
  );
}
