import { Server } from 'socket.io';
import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/db';
import { authenticateUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (req.socket.server.io) {
    return NextResponse.json({ message: 'Socket.IO already running' });
  }

  const io = new Server(req.socket.server);
  req.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinProject', async (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User joined project ${projectId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { projectId, content, senderId, attachmentUrl } = data;
      const models = await getModels();
      const { ProjectMessage } = models;

      // Save message to DB
      const newMessage = await ProjectMessage.create({
        content,
        senderId,
        projectId,
        attachmentUrl,
      });

      // Broadcast to room
      io.to(`project_${projectId}`).emit('newMessage', newMessage);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return NextResponse.json({ message: 'Socket.IO server initialized' });
}