import { RoomServiceClient } from 'livekit-server-sdk';

export function getLiveKitClient() {
  const livekitHost = process.env.LIVEKIT_URL || 'wss://fallback.livekit.cloud';
  const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
  
  return new RoomServiceClient(livekitHost, apiKey, apiSecret);
}
