import { NextResponse } from 'next/server';
import { defaultEvacuationZones } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    zones: defaultEvacuationZones,
    totalZones: defaultEvacuationZones.length,
    timestamp: new Date().toISOString(),
  });
}
