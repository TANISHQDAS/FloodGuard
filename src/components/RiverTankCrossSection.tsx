'use client';

import React from 'react';
import { TelemetryReading, MonitoringStation } from '@/lib/types';

interface RiverTankCrossSectionProps {
  station: MonitoringStation;
  reading: TelemetryReading;
}

export function RiverTankCrossSection({ station, reading }: RiverTankCrossSectionProps) {
  const percent = Math.min(100, Math.max(0, reading.waterLevelPercent));
  const warningPct = station.warningThresholdPercent;
  const dangerPct = station.dangerThresholdPercent;

  const isDanger = percent >= dangerPct;
  const isWarning = percent >= warningPct;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">River Channel Cross-Section</h3>
          <p className="text-xs text-slate-400">
            Physical acoustic water elevation profile & mounting clearance
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-mono">Current Elevation</span>
          <span className="text-lg font-black text-cyan-400 font-mono">
            {reading.waterLevelCm.toFixed(1)} cm
          </span>
        </div>
      </div>

      {/* Tank / River Channel Graphic */}
      <div className="flex gap-4">
        
        {/* Scale indicators */}
        <div className="flex flex-col justify-between text-[11px] font-mono text-slate-400 py-1 select-none text-right w-20">
          <div>
            <span className="block text-slate-200 font-bold">{station.totalDepthCm}cm</span>
            <span className="text-[9px] text-slate-500">Sensor Brim</span>
          </div>
          <div className="text-rose-400 font-bold">
            <span>{((dangerPct / 100) * station.totalDepthCm).toFixed(1)}cm</span>
            <span className="text-[9px] block">Danger ({dangerPct}%)</span>
          </div>
          <div className="text-amber-400 font-bold">
            <span>{((warningPct / 100) * station.totalDepthCm).toFixed(1)}cm</span>
            <span className="text-[9px] block">Warn ({warningPct}%)</span>
          </div>
          <div className="text-slate-400">
            <span>0.0cm</span>
            <span className="text-[9px] block">Riverbed</span>
          </div>
        </div>

        {/* Visual Channel Column */}
        <div className="flex-1 h-64 bg-slate-950 border-2 border-slate-700/80 rounded-lg relative overflow-hidden flex flex-col-reverse shadow-inner">
          
          {/* Danger threshold guideline */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-rose-500 z-20 flex justify-end pr-2 pointer-events-none"
            style={{ bottom: `${dangerPct}%` }}
          >
            <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded -mb-2.5 font-mono border border-rose-800">
              DANGER CUTOFF ({dangerPct}%)
            </span>
          </div>

          {/* Warning threshold guideline */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-amber-500 z-20 flex justify-end pr-2 pointer-events-none"
            style={{ bottom: `${warningPct}%` }}
          >
            <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded -mb-2.5 font-mono border border-amber-800">
              WARNING LEVEL ({warningPct}%)
            </span>
          </div>

          {/* Water Fill Column */}
          <div
            className={`w-full transition-all duration-700 relative overflow-hidden flex items-center justify-center ${
              isDanger
                ? 'bg-gradient-to-t from-rose-900 via-rose-700 to-rose-500'
                : isWarning || reading.isRapidRise
                ? 'bg-gradient-to-t from-amber-900 via-amber-700 to-amber-500'
                : 'bg-gradient-to-t from-blue-900 via-cyan-700 to-cyan-500'
            }`}
            style={{ height: `${percent}%` }}
          >
            {/* Wave animation line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 wave-animation" />
            
            {/* Center label */}
            {percent > 12 && (
              <div className="bg-slate-950/80 backdrop-blur px-3 py-1 rounded-md text-xs font-mono font-bold text-white shadow border border-slate-700">
                {reading.waterLevelCm.toFixed(1)} cm ({Math.round(percent)}%)
              </div>
            )}
          </div>

        </div>

      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
        <div>
          <span className="text-slate-500">Acoustic Air Gap: </span>
          <span className="text-white font-semibold">{reading.distanceCm.toFixed(1)} cm</span>
        </div>
        <div>
          <span className="text-slate-500">Transducer Datum: </span>
          <span className="text-white font-semibold">{station.totalDepthCm.toFixed(1)} cm</span>
        </div>
      </div>
    </div>
  );
}
