'use client';

import React from 'react';
import { AlertLogItem } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, Check, AlertTriangle, AlertOctagon, ShieldCheck } from 'lucide-react';

interface AlertLogTableProps {
  alerts: AlertLogItem[];
  onAcknowledge: (id: string) => void;
}

export function AlertLogTable({ alerts, onAcknowledge }: AlertLogTableProps) {
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              SCADA Incident & Telemetry Alarm Log
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              AUDIT TRAIL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Chronological audit of threshold breaches, slope surges, and acoustic telemetry events
          </p>
        </div>
        <div className="text-[11px] font-mono">
          {unacknowledgedCount > 0 ? (
            <span className="text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 font-semibold">
              {unacknowledgedCount} UNACKNOWLEDGED
            </span>
          ) : (
            <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              ALL CLEARED
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase bg-slate-900/60">
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Station Node</th>
              <th className="py-2 px-3">Alarm Class</th>
              <th className="py-2 px-3">Water Stage</th>
              <th className="py-2 px-3">Telemetry Event Description</th>
              <th className="py-2 px-3 text-right">Dispatch Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                  <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-slate-600" />
                  No flood incidents logged. All river basins operating at baseline capacity.
                </td>
              </tr>
            ) : (
              alerts.map((alt) => {
                const isCrit = alt.severity === 'critical';
                const isHigh = alt.severity === 'high';

                return (
                  <tr
                    key={alt.id}
                    className={`hover:bg-slate-850/50 transition-colors ${
                      !alt.acknowledged ? 'bg-[#0e1522]' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(alt.timestamp)}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-white whitespace-nowrap text-xs">
                      {alt.stationId}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          isCrit
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isHigh
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isCrit && <AlertOctagon className="h-3 w-3 mr-0.5" />}
                        {isHigh && <AlertTriangle className="h-3 w-3 mr-0.5" />}
                        <span>{alt.type}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-200 whitespace-nowrap text-xs">
                      {alt.waterLevelCm.toFixed(1)}cm <span className="text-slate-500 text-[10px]">({Math.round(alt.waterLevelPercent)}%)</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 text-xs">
                      {alt.message}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {alt.acknowledged ? (
                        <span className="text-[11px] text-emerald-400 font-mono inline-flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Acknowledged</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onAcknowledge(alt.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 transition-colors"
                        >
                          ACK ALARM
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
