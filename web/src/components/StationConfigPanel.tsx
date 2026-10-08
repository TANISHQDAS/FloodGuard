'use client';

import React, { useState } from 'react';
import { MonitoringStation } from '@/lib/types';
import { Sliders, Save, CheckCircle, Download, FileText, Volume2, VolumeX } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <span>Station Calibration & Audio Controller</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure riverbed datum distance, sensitivity thresholds, and export logs
          </p>
        </div>

        {/* Audio buzzer control */}
        <button
          onClick={onToggleBuzzer}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            buzzerEnabled
              ? 'bg-rose-950/80 border-rose-700 text-rose-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          {buzzerEnabled ? (
            <>
              <Volume2 className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              <span>Web Buzzer: ACTIVE</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              <span>Web Buzzer: Muted</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Total Datum Depth (cm)
          </label>
          <input
            type="number"
            step="0.5"
            min="10"
            max="1000"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
            required
          />
          <span className="text-[10px] text-slate-500">Transducer to channel floor</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Warning Cutoff (%)
          </label>
          <input
            type="number"
            min="20"
            max="95"
            value={warningPct}
            onChange={(e) => setWarningPct(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            required
          />
          <span className="text-[10px] text-slate-500">Triggers Yellow indicator</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Danger Cutoff (%)
          </label>
          <input
            type="number"
            min="30"
            max="99"
            value={dangerPct}
            onChange={(e) => setDangerPct(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-rose-500"
            required
          />
          <span className="text-[10px] text-slate-500">Triggers Red alarm & siren</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Rapid Rise Limit (cm/min)
          </label>
          <input
            type="number"
            step="0.5"
            min="1"
            max="50"
            value={rapidRiseThreshold}
            onChange={(e) => setRapidRiseThreshold(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            required
          />
          <span className="text-[10px] text-slate-500">Slope velocity sensitivity</span>
        </div>

        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950 transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{loading ? 'Saving Parameters...' : 'Apply Calibration Parameters'}</span>
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Station calibrated!</span>
              </span>
            )}
          </div>

          {/* Export telemetry triggers */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
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
