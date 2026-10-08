import { NextRequest, NextResponse } from 'next/server';
import { getAlerts, acknowledgeAlert } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const alerts = getAlerts();
  return NextResponse.json({
    alerts,
    activeCount: alerts.filter(a => !a.acknowledged).length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { alertId } = await request.json();
    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 });
    }

    const ok = acknowledgeAlert(alertId);
    if (!ok) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Alert acknowledged' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
