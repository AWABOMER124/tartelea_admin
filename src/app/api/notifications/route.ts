import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { created_at: 'desc' },
      take: 20
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.title || !body.body) {
        return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const newNotification = await db.notification.create({
      data: {
        title: body.title,
        body: body.body,
        type: body.type || 'system',
        status: 'sent'
      }
    });

    return NextResponse.json({ success: true, notification: newNotification });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
