import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await db.profile.findMany({
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, role } = await req.json();
    if (!userId || !role) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const updatedUser = await db.profile.update({
      where: { id: userId },
      data: { role }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
