'use client';

import React, { useState } from 'react';
import { RiskPredictionResult } from '@/lib/types';
import { Calculator, ShieldAlert, CheckCircle, RefreshCw, BarChart3, Info } from 'lucide-react';

interface PredictiveModelPanelProps {
  stationId: string;
  waterLevelPercent: number;
  rateOfRise: number;
  rainStatus: string;
}

export function PredictiveModelPanel({
  stationId,
  waterLevelPercent,
  rateOfRise,
  rainStatus,
}: PredictiveModelPanelProps) {
  const [prediction, setPrediction] = useState<RiskPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [soilSaturation, setSoilSaturation] = useState<number>(75);
  const [upstreamSurge, setUpstreamSurge] = useState<number>(1.2);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          waterLevelPercent,
          rateOfRise,
          rainStatus,
          soilSaturationPercent: soilSaturation,
          upstreamSurgeIndex: upstreamSurge,
        }),
      });
      const data = await res.json();
      if (data.prediction) {
        setPrediction(data.prediction);
      }
    } catch (e) {
      console.error('Failed to run hydrological prediction', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Catchment Runoff & Crest Arrival Forecast
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              HYDROLOGICAL MODEL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Unit hydrograph computation integrating precipitation intensity, antecedent soil moisture, and wave slope
          </p>
        </div>

        <button
          onClick={runPrediction}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Computing Runoff...' : 'Compute Basin Forecast'}</span>
        </button>
      </div>

      {/* Model Parameter Adjusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#0d131f] p-3 rounded-md border border-slate-800 mb-3.5">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="text-[11px] font-mono text-slate-300">ANTECEDENT SOIL SATURATION INDEX (S_soil):</span>
            <span className="font-mono text-blue-300 font-bold">{soilSaturation}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={soilSaturation}
            onChange={(e) => setSoilSaturation(Number(e.target.value))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>High Infiltration (10%)</span>
            <span>Fully Saturated / Near Zero Absorption (100%)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span className="text-[11px] font-mono text-slate-300">UPSTREAM RUNOFF SURGE FACTOR (C_surge):</span>
            <span className="font-mono text-blue-300 font-bold">{upstreamSurge.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={upstreamSurge}
            onChange={(e) => setUpstreamSurge(Number(e.target.value))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Baseflow Runoff (0.5x)</span>
            <span>Flash Cloudburst Mountain Inflow (3.0x)</span>
          </div>
        </div>
      </div>

      {/* Hydrological Forecast Outputs */}
      {prediction ? (
        <div className="bg-[#090d16] border border-slate-800 rounded-md p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Vulnerability Index</span>
              <span
                className={`text-xl font-bold font-mono ${
                  prediction.riskScore >= 75
                    ? 'text-rose-400'
                    : prediction.riskScore >= 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {prediction.riskScore} / 100
              </span>
              <span className="text-[10px] font-mono block text-slate-500 mt-0.5">
                Rating: <strong>{prediction.riskCategory}</strong>
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Time to Crest Arrival</span>
              <span className="text-xl font-bold font-mono text-white">
                {prediction.timeToCrestHours} hrs
              </span>
              <span className="text-[10px] font-mono block text-slate-500 mt-0.5">Model Confidence: {prediction.confidencePercent}%</span>
            </div>

            <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Projected Peak Stage</span>
              <span className="text-xl font-bold font-mono text-white">
                {prediction.predictedPeakCm} cm
              </span>
              <span className="text-[10px] font-mono block text-slate-500 mt-0.5">Kinematic wave projection</span>
            </div>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-start space-x-2">
              <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-white font-mono text-[11px] block mb-0.5">DISPATCH PROTOCOL:</span>
                <span className="text-slate-300 leading-relaxed">{prediction.recommendedAction}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 border border-dashed border-slate-800 rounded bg-[#0d131f]/50">
          <p className="text-xs text-slate-400">
            Click <strong className="text-slate-200">&quot;Compute Basin Forecast&quot;</strong> to evaluate unit hydrograph crest arrival and flood wave peak.
          </p>
        </div>
      )}
    </div>
  );
}
