import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalStudents = await db.profile.count();
    const activeTrainers = await db.profile.count({ where: { role: 'trainer' } });
    const activeHalaqat = await db.workshop.count({ where: { status: 'live' } });
    const totalContent = await db.content.count();

    // Mocking historical data for the chart or fetching recent activity if needed
    const stats = {
      totalStudents: totalStudents || 0,
      activeHalaqat: activeHalaqat || 0,
      totalContent: totalContent || 0,
      enlightenmentIndex: 92,
      activeTrainers: activeTrainers || 0
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
