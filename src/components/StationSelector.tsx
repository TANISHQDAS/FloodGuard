'use client';

import React from 'react';
import { MonitoringStation } from '@/lib/types';
import { MapPin, Radio, Check, AlertTriangle, AlertOctagon } from 'lucide-react';

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
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <Radio className="h-4 w-4 text-blue-400" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
            Catchment Monitoring Stations ({stations.length} Active Telemetry Nodes)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Active Station: <strong className="text-white">{selectedStationId}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {stations.map((st) => {
          const isSelected = st.id === selectedStationId;
          const reading = st.currentReading;
          const isDanger = reading.alertLevel === 'DANGER';
          const isWarning = reading.alertLevel === 'WARNING' || reading.isRapidRise;

          return (
            <button
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className={`text-left p-3 rounded-md border transition-all relative ${
                isSelected
                  ? 'bg-slate-850 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                  : 'bg-[#0d131f] border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono font-bold text-white">{st.id}</span>
                    {st.isHardwareNode ? (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-mono font-medium">
                        ESP32 IoT
                      </span>
                    ) : (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        Node
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-1">{st.name}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5 font-normal">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{st.location}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isDanger
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isWarning
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {reading.alertLevel}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-semibold">
                  {reading.waterLevelCm.toFixed(1)} cm <span className="text-slate-500 font-normal">({Math.round(reading.waterLevelPercent)}%)</span>
                </span>
                <span className={reading.rateOfRiseCmPerMin > 2 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
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
