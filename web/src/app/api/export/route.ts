import { NextRequest, NextResponse } from 'next/server';
import { getTelemetryHistory, getStationById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId') || 'FG-NODE-01';
  const format = searchParams.get('format') || 'csv';

  const station = getStationById(stationId);
  if (!station) {
    return NextResponse.json({ error: 'Station not found' }, { status: 404 });
  }

  const history = getTelemetryHistory(stationId);

  if (format === 'json') {
    return NextResponse.json({
      station,
      exportedAt: new Date().toISOString(),
      readings: history,
    });
  }

  // Generate CSV formatted output
  const headers = [
    'Timestamp',
    'Station_ID',
    'Station_Name',
    'Distance_cm',
    'Water_Level_cm',
    'Capacity_Percent',
    'Rate_of_Rise_cm_per_min',
    'Is_Rapid_Rise',
    'Rain_Status',
    'Rain_Analog_ADC',
    'Alert_Level',
    'Sensor_Fault'
  ];

  const rows = history.map(r => [
    r.timestamp,
    r.stationId,
    `"${r.stationName}"`,
    r.distanceCm.toFixed(1),
    r.waterLevelCm.toFixed(1),
    r.waterLevelPercent.toFixed(1),
    r.rateOfRiseCmPerMin.toFixed(2),
    r.isRapidRise ? 'YES' : 'NO',
    r.rainStatus,
    r.rainAnalogValue,
    r.alertLevel,
    r.sensorError ? 'ERROR' : 'OK'
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="floodguard_telemetry_${stationId}_${Date.now()}.csv"`,
    },
  });
}
