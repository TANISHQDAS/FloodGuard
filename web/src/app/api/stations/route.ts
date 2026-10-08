import { NextRequest, NextResponse } from 'next/server';
import { getStations, updateStationConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stations = getStations();
  return NextResponse.json({
    stations,
    totalCount: stations.length,
    timestamp: new Date().toISOString(),
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...config } = body;

    if (!id) {
      return NextResponse.json({ error: 'Station ID is required' }, { status: 400 });
    }

    const updated = updateStationConfig(id, config);
    if (!updated) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      station: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update station', details: err.message }, { status: 400 });
  }
}
