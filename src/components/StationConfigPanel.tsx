'use client';

import React, { useState } from 'react';
import { MonitoringStation } from '@/lib/types';
import { Sliders, Save, CheckCircle, Download, FileText, Volume2, VolumeX, Settings } from 'lucide-react';

interface StationConfigPanelProps {
  station: MonitoringStation;
  onUpdateConfig: (updated: Partial<MonitoringStation>) => Promise<void>;
  buzzerEnabled: boolean;
  onToggleBuzzer: () => void;
}

export function StationConfigPanel({
  station,
  onUpdateConfig,
  buzzerEnabled,
  onToggleBuzzer,
}: StationConfigPanelProps) {
  const [depth, setDepth] = useState<number>(station.totalDepthCm);
  const [warningPct, setWarningPct] = useState<number>(station.warningThresholdPercent);
  const [dangerPct, setDangerPct] = useState<number>(station.dangerThresholdPercent);
  const [rapidRiseThreshold, setRapidRiseThreshold] = useState<number>(station.rapidRiseThreshold);
  const [saved, setSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await onUpdateConfig({
        totalDepthCm: depth,
        warningThresholdPercent: warningPct,
        dangerThresholdPercent: dangerPct,
        rapidRiseThreshold,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/export?stationId=${station.id}&format=csv`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`/api/export?stationId=${station.id}&format=json`, '_blank');
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Station Datum Calibration & Telemetry Export
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              FIELD CONFIG
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Calibrate riverbed mounting elevation, threshold triggers, and audio siren synthesizer
          </p>
        </div>

        {/* Web Audio Buzzer Control */}
        <button
          onClick={onToggleBuzzer}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors ${
            buzzerEnabled
              ? 'bg-rose-950/70 border-rose-700 text-rose-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
          }`}
          title="Toggle browser audio buzzer synthesis for DANGER and RAPID RISE conditions"
        >
          {buzzerEnabled ? (
            <>
              <Volume2 className="h-3.5 w-3.5 text-rose-400" />
              <span>SIREN: ENABLED (2.4kHz)</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              <span>SIREN: MUTED</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
        <div>
          <label className="block text-[11px] font-mono text-slate-300 mb-1">
            TRANSDUCER DATUM HEIGHT (cm)
          </label>
          <input
            type="number"
            step="0.5"
            min="10"
            max="1000"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-[#0d131f] border border-slate-800 rounded text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            required
          />
          <span className="text-[10px] text-slate-500 font-mono">Distance from sensor to channel floor</span>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-300 mb-1">
            WARNING THRESHOLD (%)
          </label>
          <input
            type="number"
            min="20"
            max="95"
            value={warningPct}
            onChange={(e) => setWarningPct(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-[#0d131f] border border-slate-800 rounded text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            required
          />
          <span className="text-[10px] text-slate-500 font-mono">Triggers yellow status and SMS warning</span>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-300 mb-1">
            DANGER THRESHOLD (%)
          </label>
          <input
            type="number"
            min="30"
            max="99"
            value={dangerPct}
            onChange={(e) => setDangerPct(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-[#0d131f] border border-slate-800 rounded text-white font-mono text-xs focus:outline-none focus:border-rose-500"
            required
          />
          <span className="text-[10px] text-slate-500 font-mono">Triggers red alarm, sirens and evacuations</span>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-300 mb-1">
            RAPID SURGE VELOCITY (cm/min)
          </label>
          <input
            type="number"
            step="0.5"
            min="1"
            max="50"
            value={rapidRiseThreshold}
            onChange={(e) => setRapidRiseThreshold(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-[#0d131f] border border-slate-800 rounded text-white font-mono text-xs focus:outline-none focus:border-amber-500"
            required
          />
          <span className="text-[10px] text-slate-500 font-mono">Slope sensitivity for early flash surge warning</span>
        </div>

        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{loading ? 'Applying Changes...' : 'Save Calibration Parameters'}</span>
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Station calibrated successfully</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
