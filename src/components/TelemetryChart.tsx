'use client';

import React from 'react';
import { TelemetryReading, MonitoringStation } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatDateTime } from '@/lib/utils';
import { Activity, Clock } from 'lucide-react';

interface TelemetryChartProps {
  history: TelemetryReading[];
  station: MonitoringStation;
}

export function TelemetryChart({ history, station }: TelemetryChartProps) {
  const chartData = history.map((pt) => ({
    time: formatDateTime(pt.timestamp),
    waterLevelCm: pt.waterLevelCm,
    distanceCm: pt.distanceCm,
    rateOfRise: pt.rateOfRiseCmPerMin,
    alertLevel: pt.alertLevel,
  }));

  const warningCm = (station.warningThresholdPercent / 100) * station.totalDepthCm;
  const dangerCm = (station.dangerThresholdPercent / 100) * station.totalDepthCm;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-sm h-full flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hydrological Stage Hydrograph
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              TIME-SERIES
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Stage elevation (cm) vs. calibrated warning ({warningCm.toFixed(1)}cm) and flood danger ({dangerCm.toFixed(1)}cm) cutoffs
          </p>
        </div>

        {/* Technical chart legend */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block"></span>
            <span className="text-slate-300">Stage (cm)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-0.5 w-3 bg-amber-400 inline-block"></span>
            <span className="text-amber-400">Warning ({station.warningThresholdPercent}%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-0.5 w-3 bg-rose-500 inline-block"></span>
            <span className="text-rose-400">Danger ({station.dangerThresholdPercent}%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            <Activity className="h-4 w-4 mr-2 animate-spin text-slate-400" />
            Polling real-time telemetry from catchment node...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1f293d" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                interval="preserveStartEnd"
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                domain={[0, Math.ceil(station.totalDepthCm * 1.05)]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                unit="cm"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d131f',
                  borderColor: '#334155',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#f8fafc',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                }}
                formatter={(value: any, name: string) => [
                  `${value} cm`,
                  name === 'waterLevelCm' ? 'Water Elevation' : name,
                ]}
              />
              {/* Reference Lines */}
              <ReferenceLine
                y={warningCm}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'WARNING STAGE',
                  fill: '#f59e0b',
                  fontSize: 9,
                  position: 'right',
                }}
              />
              <ReferenceLine
                y={dangerCm}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'FLOOD STAGE',
                  fill: '#ef4444',
                  fontSize: 9,
                  position: 'right',
                }}
              />
              <Line
                type="monotone"
                dataKey="waterLevelCm"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#60a5fa', strokeWidth: 2, fill: '#1e3a8a' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Station Datum: {station.totalDepthCm.toFixed(1)} cm channel baseline</span>
        <span>Sampling interval: 2.0s • Buffer capacity: 100 observations</span>
      </div>
    </div>
  );
}
