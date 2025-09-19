import type { NextApiRequest, NextApiResponse } from 'next';
import { initIO } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: 'nodejs',
};

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // @ts-ignore - Next.js provides res.socket.server in Node runtime
    const server = res.socket?.server as any;
    if (!server) {
      return res.status(500).json({ message: 'Server socket not available' });
    }

    // Reuse once attached
    // @ts-ignore
    if (!server.__io) {
      const io = initIO(server);
      // @ts-ignore
      server.__io = io;
      // Note: default path is '/socket.io'; we keep it to match client
    }
    return res.status(200).json({ message: 'Socket.IO server ready' });
  } catch (e: any) {
    console.error('Socket bootstrap error:', e?.message || e);
    return res.status(500).json({ message: 'Socket bootstrap failed' });
  }
}
