'use client';

import React from 'react';
import { ShieldAlert, Activity, Bell, Wifi, Radio } from 'lucide-react';

interface HeaderProps {
  activeStationCount: number;
  criticalAlertCount: number;
  lastPingTime: string;
  isSimulating: boolean;
  onToggleSimulate: () => void;
}

export function Header({
  activeStationCount,
  criticalAlertCount,
  lastPingTime,
  isSimulating,
  onToggleSimulate,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">FloodGuard</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold tracking-wider uppercase">
                Enterprise IoT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              River Level Telemetry & Community Early Warning Architecture
            </p>
          </div>
        </div>

        {/* Global indicators & Action buttons */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Active nodes counter */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Stations Online:</span>
            <span className="font-semibold text-white">{activeStationCount}</span>
          </div>

          {/* Critical alerts badge */}
          {criticalAlertCount > 0 ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-xs text-rose-300 font-medium">
              <Bell className="h-3.5 w-3.5 text-rose-400" />
              <span>{criticalAlertCount} Active Alarms</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>All Basins Nominal</span>
            </div>
          )}

          {/* Simulator toggle button */}
          <button
            onClick={onToggleSimulate}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSimulating
                ? 'bg-amber-950/70 border-amber-600/80 text-amber-200 hover:bg-amber-900/80'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Activity className={`h-3.5 w-3.5 ${isSimulating ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
            <span>{isSimulating ? 'Simulation Running' : 'Start Simulation'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
