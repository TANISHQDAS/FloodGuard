import { NextRequest, NextResponse } from 'next/server';
import { getTelemetryHistory, recordTelemetryReading, getStationById } from '@/lib/db';
import { AlertLevel, RainStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId') || 'FG-NODE-01';

  const station = getStationById(stationId);
  if (!station) {
    return NextResponse.json({ error: 'Station not found' }, { status: 404 });
  }

  const history = getTelemetryHistory(stationId);

  return NextResponse.json({
    station,
    current: station.currentReading,
    history,
    count: history.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const stationId = body.device_id || body.stationId || 'FG-NODE-01';
    const distanceCm = typeof body.distance_cm === 'number' ? body.distance_cm : 30.0;
    const waterLevelCm = typeof body.water_level_cm === 'number' ? body.water_level_cm : 10.0;
    const waterLevelPercent = typeof body.water_level_percent === 'number' ? body.water_level_percent : 20.0;
    const rateOfRise = typeof body.rate_of_rise === 'number' ? body.rate_of_rise : (body.rateOfRiseCmPerMin || 0.0);
    const isRapidRise = Boolean(body.is_rapid_rise ?? body.isRapidRise);
    const rainStatus = (body.rain_status || body.rainStatus || 'No Rain') as RainStatus;
    const rainAnalog = typeof body.rain_analog === 'number' ? body.rain_analog : (body.rainAnalogValue || 3500);
    const alertLevel = (body.alert_level || body.alertLevel || 'NORMAL') as AlertLevel;
    const sensorError = Boolean(body.sensor_error ?? body.sensorError);
    const batteryPercent = typeof body.battery_percent === 'number' ? body.battery_percent : 92;

    const { reading, alertCreated } = recordTelemetryReading({
      stationId,
      timestamp: new Date().toISOString(),
      distanceCm,
      waterLevelCm,
      waterLevelPercent,
      rateOfRiseCmPerMin: rateOfRise,
      isRapidRise,
      rainStatus,
      rainAnalogValue: rainAnalog,
      alertLevel,
      sensorError,
      batteryPercent,
    });

    return NextResponse.json({
      success: true,
      message: 'Telemetry ingested successfully',
      reading,
      alertCreated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid telemetry payload', details: err.message },
      { status: 400 }
    );
  }
}
