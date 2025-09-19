import { Server } from 'socket.io';

declare global {
  // eslint-disable-next-line no-var
  var __io: Server | undefined;
}

let io: Server | null = (global as any).__io || null;

export function initIO(server: any) {
  if (!io) {
    io = new Server(server);
    (global as any).__io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('joinProject', (projectId: string) => {
        socket.join(`project_${projectId}`);
        console.log(`User joined project ${projectId}`);
      });

      // Join a task room to receive realtime task comment updates
      socket.on('joinTask', (taskId: string) => {
        socket.join(`task_${taskId}`);
        console.log(`User joined task ${taskId}`);
      });

      // Join user room for messaging
      socket.on('joinUser', (userId: string) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined messaging`);
      });

      // Handle message events
      socket.on('sendMessage', (message) => {
        if (message.chatType === 'group') {
          io.emit('newMessage', message);
        } else {
          socket.to(`user_${message.receiverId}`).emit('newMessage', message);
        }
      });

      // Typing indicators
      socket.on('typing', (payload: { chatType: 'individual' | 'group'; receiverId?: string | number; senderId: number; senderName?: string }) => {
        try {
          if (payload.chatType === 'group') {
            io.emit('typing', { senderId: payload.senderId, senderName: payload.senderName, chatType: 'group' });
          } else if (payload.receiverId) {
            socket.to(`user_${payload.receiverId}`).emit('typing', { senderId: payload.senderId, senderName: payload.senderName, chatType: 'individual' });
          }
        } catch (e) {
          console.warn('typing emit failed', e);
        }
      });

      socket.on('stopTyping', (payload: { chatType: 'individual' | 'group'; receiverId?: string | number; senderId: number }) => {
        try {
          if (payload.chatType === 'group') {
            io.emit('stopTyping', { senderId: payload.senderId, chatType: 'group' });
          } else if (payload.receiverId) {
            socket.to(`user_${payload.receiverId}`).emit('stopTyping', { senderId: payload.senderId, chatType: 'individual' });
          }
        } catch (e) {
          console.warn('stopTyping emit failed', e);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  return io;
}

export function getIO() {
  if (!io) {
    // Try to pick from global if set by pages API
    const g = (globalThis as any).__io as Server | undefined;
    if (g) {
      io = g;
      return io;
    }
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function ensureIO() {
  const g = (globalThis as any).__io as Server | undefined;
  if (g) io = g;
  return io;
}