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
import { TrendingUp, Activity } from 'lucide-react';

interface TelemetryChartProps {
  history: TelemetryReading[];
  station: MonitoringStation;
}

export function TelemetryChart({ history, station }: TelemetryChartProps) {
  // Format chart data points
  const chartData = history.map((pt) => ({
    time: formatDateTime(pt.timestamp),
    waterLevelCm: pt.waterLevelCm,
    rateOfRise: pt.rateOfRiseCmPerMin,
    alertLevel: pt.alertLevel,
  }));

  const warningCm = (station.warningThresholdPercent / 100) * station.totalDepthCm;
  const dangerCm = (station.dangerThresholdPercent / 100) * station.totalDepthCm;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">Water Level Hydrograph</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Live Stream
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time elevation trend with Warning ({station.warningThresholdPercent}%) & Danger ({station.dangerThresholdPercent}%) thresholds
          </p>
        </div>

        {/* Legend notes */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block"></span>
            <span className="text-slate-300">Level (cm)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-0.5 w-3 bg-amber-500 inline-block"></span>
            <span className="text-amber-400">Warning ({warningCm.toFixed(1)}cm)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-0.5 w-3 bg-rose-500 inline-block"></span>
            <span className="text-rose-400">Danger ({dangerCm.toFixed(1)}cm)</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            <Activity className="h-5 w-5 mr-2 animate-spin" />
            Awaiting station telemetry samples...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                domain={[0, Math.ceil(station.totalDepthCm * 1.1)]}
                tick={{ fontSize: 11 }}
                unit="cm"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#f8fafc',
                }}
                formatter={(value: any) => [`${value} cm`, 'Water Level']}
              />
              {/* Dynamic Threshold Lines */}
              <ReferenceLine
                y={warningCm}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'WARNING',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <ReferenceLine
                y={dangerCm}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'DANGER',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Line
                type="monotone"
                dataKey="waterLevelCm"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, stroke: '#38bdf8', strokeWidth: 2, fill: '#0369a1' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
