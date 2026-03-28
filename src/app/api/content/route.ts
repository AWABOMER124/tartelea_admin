import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const content = await db.content.findMany({
      where: type ? { type } : undefined,
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.title || !body.type) {
        return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    const newContent = await db.content.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        content_url: body.content_url,
        thumbnail_url: body.thumbnail_url
      }
    });

    return NextResponse.json({ success: true, content: newContent });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
