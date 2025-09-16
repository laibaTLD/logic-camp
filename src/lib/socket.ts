import { Server } from 'socket.io';

let io: Server | null = null;

export function initIO(server: any) {
  if (!io) {
    io = new Server(server);

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

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}