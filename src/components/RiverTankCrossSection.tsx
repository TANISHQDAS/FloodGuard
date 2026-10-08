'use client';

import React from 'react';
import { TelemetryReading, MonitoringStation } from '@/lib/types';
import { ArrowDown, Radio } from 'lucide-react';

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

  const warningCm = (warningPct / 100) * station.totalDepthCm;
  const dangerCm = (dangerPct / 100) * station.totalDepthCm;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
            <Radio className="h-4 w-4 text-blue-400" />
            <span>Acoustic Stage Gauge Profile</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Transducer sounding cross-section & channel datum
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Stage Elevation</span>
          <span className="text-base font-extrabold font-mono text-white">
            {reading.waterLevelCm.toFixed(1)} <span className="text-xs text-slate-400">cm</span>
          </span>
        </div>
      </div>

      {/* Main Sounding Diagram */}
      <div className="flex gap-2.5 my-1">
        
        {/* Metric Staff Gauge Scale (ticks & elevations) */}
        <div className="flex flex-col justify-between text-[10px] font-mono text-slate-400 py-1 select-none text-right w-16 border-r border-slate-800 pr-2">
          <div>
            <span className="text-slate-300 font-bold block">{station.totalDepthCm.toFixed(0)}cm</span>
            <span className="text-[9px] text-slate-500">Transducer</span>
          </div>
          <div className="text-rose-400">
            <span className="font-bold block">{dangerCm.toFixed(1)}cm</span>
            <span className="text-[9px] text-rose-400/80">Danger ({dangerPct}%)</span>
          </div>
          <div className="text-amber-400">
            <span className="font-bold block">{warningCm.toFixed(1)}cm</span>
            <span className="text-[9px] text-amber-400/80">Warn ({warningPct}%)</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block">0.0cm</span>
            <span className="text-[9px] text-slate-500">Riverbed</span>
          </div>
        </div>

        {/* Visual Channel & Sounding Column */}
        <div className="flex-1 h-60 bg-[#090d16] border border-slate-700/80 rounded relative overflow-hidden flex flex-col-reverse shadow-inner">
          
          {/* Top Transducer Mount Graphic */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 border-b border-slate-700 flex items-center justify-center space-x-2 z-30">
            <div className="h-2 w-3 rounded-full bg-slate-900 border border-slate-600"></div>
            <div className="h-2 w-3 rounded-full bg-slate-900 border border-slate-600"></div>
            <span className="text-[9px] font-mono text-slate-300 uppercase">HC-SR04 / JSN-SR04T Sensor</span>
          </div>

          {/* Acoustic ping cone simulation lines */}
          <div className="absolute top-6 left-0 right-0 bottom-0 pointer-events-none flex justify-center opacity-15">
            <div className="w-0 border-l border-r border-dashed border-cyan-300" style={{ transform: 'scaleX(20)' }}></div>
          </div>

          {/* Danger threshold line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-rose-500 z-20 flex justify-end pr-1.5 pointer-events-none"
            style={{ bottom: `${dangerPct}%` }}
          >
            <span className="text-[9px] bg-rose-950/90 text-rose-300 px-1 py-0.2 rounded -mb-2 font-mono border border-rose-800">
              DANGER ({dangerPct}%)
            </span>
          </div>

          {/* Warning threshold line */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-amber-500 z-20 flex justify-end pr-1.5 pointer-events-none"
            style={{ bottom: `${warningPct}%` }}
          >
            <span className="text-[9px] bg-amber-950/90 text-amber-300 px-1 py-0.2 rounded -mb-2 font-mono border border-amber-800">
              WARNING ({warningPct}%)
            </span>
          </div>

          {/* Water Column */}
          <div
            className={`w-full transition-all duration-300 relative border-t-2 ${
              isDanger
                ? 'bg-rose-950/70 border-rose-400'
                : isWarning || reading.isRapidRise
                ? 'bg-amber-950/70 border-amber-400'
                : 'bg-blue-950/70 border-blue-400'
            }`}
            style={{ height: `${percent}%` }}
          >
            {/* Water surface label */}
            <div className="absolute top-1 right-2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-slate-700">
              {reading.waterLevelCm.toFixed(1)} cm ({Math.round(percent)}%)
            </div>
          </div>

        </div>

      </div>

      {/* Engineering sounding parameters */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded border border-slate-800 text-slate-400">
        <div>
          <span className="text-slate-500 block text-[10px]">ACOUSTIC AIR GAP</span>
          <span className="text-slate-200 font-bold">{reading.distanceCm.toFixed(1)} cm</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">DATUM ELEVATION</span>
          <span className="text-slate-200 font-bold">{station.totalDepthCm.toFixed(1)} cm</span>
        </div>
      </div>

    </div>
  );
}
