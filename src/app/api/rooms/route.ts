import { NextResponse } from 'next/server';
import { getLiveKitClient } from '@/lib/livekit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const livekitClient = getLiveKitClient();
    const rooms = await livekitClient.listRooms();
    
    // For each room, get participants
    const roomsWithParticipants = await Promise.all(rooms.map(async (room: any) => {
      const participants = await livekitClient.listParticipants(room.name);
      return {
        ...room,
        participantCount: participants.length,
        participants: participants.map((p: any) => ({
          identity: p.identity,
          name: p.name,
          joinedAt: p.joinedAt
        }))
      };
    }));

    return NextResponse.json({ 
      success: true, 
      rooms: roomsWithParticipants,
      serverStatus: 'online'
    });
  } catch (error: any) {
    console.error('LiveKit Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      serverStatus: 'offline'
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { roomName } = await req.json();
    if (!roomName) {
      return NextResponse.json({ error: 'Room name required' }, { status: 400 });
    }

    const livekitClient = getLiveKitClient();
    await livekitClient.deleteRoom(roomName);
    
    return NextResponse.json({ success: true, message: `Room ${roomName} deleted` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


