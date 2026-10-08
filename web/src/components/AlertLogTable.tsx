'use client';

import React from 'react';
import { AlertLogItem } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, Check, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface AlertLogTableProps {
  alerts: AlertLogItem[];
  onAcknowledge: (id: string) => void;
}

export function AlertLogTable({ alerts, onAcknowledge }: AlertLogTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <span>Incident & Telemetry Alert Audit Log</span>
          </h3>
          <p className="text-xs text-slate-400">
            Chronological audit of threshold breaches, rapid surges, and sensor states
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {alerts.filter((a) => !a.acknowledged).length} unacknowledged
        </span>
      </div>

      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Station</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Water Level</th>
              <th className="py-2 px-3">Details / Message</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  No flood incidents logged. All rivers operating at nominal capacity.
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
                      !alt.acknowledged ? 'bg-slate-950/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {formatDateTime(alt.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white whitespace-nowrap">
                      {alt.stationId}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
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
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {alt.waterLevelCm.toFixed(1)}cm ({Math.round(alt.waterLevelPercent)}%)
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs">
                      {alt.message}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {alt.acknowledged ? (
                        <span className="text-[11px] text-emerald-400 inline-flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>Cleared</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onAcknowledge(alt.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-all"
                        >
                          Acknowledge
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
