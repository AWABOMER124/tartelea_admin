import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workshops = await db.workshop.findMany({
      include: {
        trainer: { select: { full_name: true } }
      },
      orderBy: { scheduled_at: 'asc' }
    });
    return NextResponse.json({ success: true, workshops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const updatedWorkshop = await db.workshop.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, workshop: updatedWorkshop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
