'use client';

import React from 'react';
import { EvacuationZone } from '@/lib/types';
import { Navigation, Users, Shield, PhoneCall } from 'lucide-react';

interface EvacuationMapPanelProps {
  zones: EvacuationZone[];
}

export function EvacuationMapPanel({ zones }: EvacuationMapPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Community Evacuation Routes & Safe Havens</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Designated high-elevation shelters and emergency arterial corridors
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
          {zones.length} Active Sectors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {zones.map((zone) => {
          const isHigh = zone.riskLevel === 'HIGH' || zone.riskLevel === 'CRITICAL';
          const isModerate = zone.riskLevel === 'MODERATE';

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                isHigh
                  ? 'bg-rose-950/20 border-rose-800/80'
                  : isModerate
                  ? 'bg-amber-950/20 border-amber-800/80'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400">{zone.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isHigh
                        ? 'bg-rose-900 text-rose-200 border border-rose-700'
                        : isModerate
                        ? 'bg-amber-900 text-amber-200 border border-amber-700'
                        : 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                    }`}
                  >
                    {zone.riskLevel} Risk
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">{zone.name}</h4>

                <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                  <div className="flex items-start space-x-1.5">
                    <Shield className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400">
                      Shelter: <strong className="text-white">{zone.safeHavenLocation}</strong>
                    </span>
                  </div>

                  <div className="flex items-start space-x-1.5">
                    <Navigation className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400">
                      Route: <strong className="text-slate-200">{zone.primaryEvacuationRoute}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-400">
                      Population: <strong className="text-slate-200">{zone.estimatedPopulation.toLocaleString()} citizens</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400">
                  <PhoneCall className="h-3 w-3 text-cyan-400" />
                  <span>{zone.contactOfficer}</span>
                </div>
                <a
                  href={`tel:${zone.contactPhone}`}
                  className="font-mono text-cyan-400 hover:underline"
                >
                  {zone.contactPhone}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
