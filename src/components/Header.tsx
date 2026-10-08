'use client';

import React from 'react';
import Link from 'next/link';
import { Waves, Radio, Bell, Activity, FileText, Code2, PlayCircle, ShieldCheck } from 'lucide-react';

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
    <header className="border-b border-slate-800/90 bg-[#0d131f] sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="h-9 w-9 rounded-md bg-slate-850 border border-slate-700/80 flex items-center justify-center text-blue-400 shadow-sm">
            <Waves className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">FloodGuard</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                v2.4-PROD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Autonomous River Telemetry & Catchment Early Warning
            </p>
          </div>
        </div>

        {/* Status Indicators & Navigation */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Active nodes telemetry badge */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">NODES ONLINE:</span>
            <span className="font-mono font-bold text-white text-xs">{activeStationCount}</span>
          </div>

          {/* Alarm status readout */}
          {criticalAlertCount > 0 ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-rose-950/70 border border-rose-800/80 text-xs text-rose-200">
              <Bell className="h-3.5 w-3.5 text-rose-400" />
              <span className="font-semibold text-rose-200">{criticalAlertCount} ALARMS ACTIVE</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/70 border border-slate-800/80 text-xs text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-400">BASIN STATUS: NOMINAL</span>
            </div>
          )}

          {/* Navigation links */}
          <div className="flex items-center space-x-1 pl-1 border-l border-slate-800">
            <Link
              href="/report"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <FileText className="h-3 w-3 text-slate-400" />
              <span>IEEE Paper</span>
            </Link>
            <Link
              href="/code"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <Code2 className="h-3 w-3 text-slate-400" />
              <span>Source</span>
            </Link>
            <Link
              href="/demo"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-blue-900/60 hover:bg-blue-800/70 border border-blue-700/60 text-blue-200 hover:text-white text-xs font-medium transition-colors"
            >
              <PlayCircle className="h-3 w-3 text-blue-300" />
              <span>Demo Walkthrough</span>
            </Link>
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulate}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isSimulating
                ? 'bg-amber-950/70 border-amber-600/80 text-amber-200 hover:bg-amber-900/80'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Toggle continuous flood test simulation cycle"
          >
            <Activity className={`h-3.5 w-3.5 ${isSimulating ? 'text-amber-400 animate-spin' : 'text-slate-400'}`} />
            <span className="font-mono text-[11px]">{isSimulating ? 'SIM: RUNNING' : 'RUN SIMULATION'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
