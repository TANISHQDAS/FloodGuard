'use client';

import React, { useState } from 'react';
import { RiskPredictionResult } from '@/lib/types';
import { Brain, Cpu, ShieldAlert, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';

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
      console.error('Failed to run prediction', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Hydrological Risk & Forecast Model</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
              AI Risk Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates precipitation intensity, catchment soil saturation, and ultrasonic slope
          </p>
        </div>

        <button
          onClick={runPrediction}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Evaluating Model...' : 'Run Catchment Inference'}</span>
        </button>
      </div>

      {/* Parameter adjusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 mb-4">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Soil Saturation Index:</span>
            <span className="font-mono text-purple-300 font-bold">{soilSaturation}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={soilSaturation}
            onChange={(e) => setSoilSaturation(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">Higher saturation reduces soil infiltration capacity</span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Upstream Runoff Surge Index:</span>
            <span className="font-mono text-purple-300 font-bold">{upstreamSurge.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={upstreamSurge}
            onChange={(e) => setUpstreamSurge(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">Accounts for cloudburst release from mountain heads</span>
        </div>
      </div>

      {/* Model Output Card */}
      {prediction ? (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase">Calculated Risk Index</span>
              <span
                className={`text-2xl font-black ${
                  prediction.riskScore >= 75
                    ? 'text-rose-400'
                    : prediction.riskScore >= 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {prediction.riskScore} / 100
              </span>
              <span className="text-[10px] block text-slate-500 mt-0.5">
                Category: <strong>{prediction.riskCategory}</strong>
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase">Estimated Crest Window</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {prediction.timeToCrestHours} hrs
              </span>
              <span className="text-[10px] block text-slate-500 mt-0.5">Confidence: {prediction.confidencePercent}%</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase">Forecast Peak Crest</span>
              <span className="text-2xl font-black text-white font-mono">
                {prediction.predictedPeakCm} cm
              </span>
              <span className="text-[10px] block text-slate-500 mt-0.5">Based on slope momentum</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200">
            <div className="flex items-start space-x-2">
              <ShieldAlert className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-white">Recommended Civil Defense Action: </span>
                <span>{prediction.recommendedAction}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">
            Click <strong>&quot;Run Catchment Inference&quot;</strong> to assess flood risk index and estimated time to peak crest.
          </p>
        </div>
      )}
    </div>
  );
}
