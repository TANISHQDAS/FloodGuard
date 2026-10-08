import { NextRequest, NextResponse } from 'next/server';
import { calculateHydrologicalRisk, getStationById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stationId = body.stationId;

    let waterLevelPercent = body.waterLevelPercent;
    let rateOfRise = body.rateOfRise;
    let rainStatus = body.rainStatus || 'Light Rain';

    if (stationId) {
      const station = getStationById(stationId);
      if (station) {
        waterLevelPercent = waterLevelPercent ?? station.currentReading.waterLevelPercent;
        rateOfRise = rateOfRise ?? station.currentReading.rateOfRiseCmPerMin;
        rainStatus = rainStatus ?? station.currentReading.rainStatus;
      }
    }

    const soilSaturation = typeof body.soilSaturationPercent === 'number' ? body.soilSaturationPercent : 74;
    const upstreamSurge = typeof body.upstreamSurgeIndex === 'number' ? body.upstreamSurgeIndex : 1.25;

    const result = calculateHydrologicalRisk(
      waterLevelPercent ?? 50,
      rateOfRise ?? 1.5,
      rainStatus,
      soilSaturation,
      upstreamSurge
    );

    return NextResponse.json({
      success: true,
      parameters: {
        waterLevelPercent,
        rateOfRise,
        rainStatus,
        soilSaturation,
        upstreamSurge,
      },
      prediction: result,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Prediction calculation failed', details: err.message }, { status: 400 });
  }
}
