'use client';

import React from 'react';
import { MonitoringStation } from '@/lib/types';
import { MapPin, Radio, Wifi, AlertTriangle } from 'lucide-react';

interface StationSelectorProps {
  stations: MonitoringStation[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
}

export function StationSelector({
  stations,
  selectedStationId,
  onSelectStation,
}: StationSelectorProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Radio className="h-4 w-4 text-cyan-400" />
          <span>Monitoring Stations ({stations.length})</span>
        </h3>
        <span className="text-xs text-slate-400">Select active telemetry node</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stations.map((st) => {
          const isSelected = st.id === selectedStationId;
          const reading = st.currentReading;
          const isDanger = reading.alertLevel === 'DANGER';
          const isWarning = reading.alertLevel === 'WARNING' || reading.isRapidRise;

          return (
            <button
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className={`text-left p-3.5 rounded-lg border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-400">{st.id}</span>
                    {st.isHardwareNode && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        ESP32
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">{st.name}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{st.location}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isDanger
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : isWarning
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {reading.alertLevel}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  {reading.waterLevelCm.toFixed(1)} cm ({Math.round(reading.waterLevelPercent)}%)
                </span>
                <span className={reading.rateOfRiseCmPerMin > 2 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {reading.rateOfRiseCmPerMin >= 0 ? `+${reading.rateOfRiseCmPerMin.toFixed(1)}` : reading.rateOfRiseCmPerMin.toFixed(1)} cm/m
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
