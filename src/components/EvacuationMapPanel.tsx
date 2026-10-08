'use client';

import React from 'react';
import { EvacuationZone } from '@/lib/types';
import { MapPin, Shield, PhoneCall, Users, Navigation } from 'lucide-react';

interface EvacuationMapPanelProps {
  zones: EvacuationZone[];
}

export function EvacuationMapPanel({ zones }: EvacuationMapPanelProps) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Municipal Evacuation Sectors & Safe Havens
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              DISASTER PROTOCOL
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Designated high-elevation shelters, arterial egress corridors, and civil defense coordinators
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Total Sectors: <strong className="text-white">{zones.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {zones.map((zone) => {
          const isHigh = zone.riskLevel === 'HIGH' || zone.riskLevel === 'CRITICAL';
          const isModerate = zone.riskLevel === 'MODERATE';

          return (
            <div
              key={zone.id}
              className={`p-3.5 rounded-md border flex flex-col justify-between ${
                isHigh
                  ? 'bg-rose-950/20 border-rose-800/80'
                  : isModerate
                  ? 'bg-amber-950/20 border-amber-800/80'
                  : 'bg-[#0d131f] border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-300">{zone.id}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      isHigh
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isModerate
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {zone.riskLevel}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-2">{zone.name}</h4>

                <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                  <div className="flex items-start space-x-1.5">
                    <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-[11px]">
                      Safe Haven: <strong className="text-slate-200">{zone.safeHavenLocation}</strong>
                    </span>
                  </div>

                  <div className="flex items-start space-x-1.5">
                    <Navigation className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-400 text-[11px]">
                      Arterial Egress: <strong className="text-slate-200">{zone.primaryEvacuationRoute}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-400 text-[11px]">
                      Population at Risk: <strong className="text-slate-200">{zone.estimatedPopulation.toLocaleString()} residents</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 truncate mr-2">{zone.contactOfficer}</span>
                <a
                  href={`tel:${zone.contactPhone}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
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
