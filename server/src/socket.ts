import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function initializeSocket(httpServer: HttpServer, corsOrigin: string): TypedServer {
  const io: TypedServer = new Server(httpServer, {
    cors: {
      origin: corsOrigin || '*',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join default rooms
    socket.join('overlay');
    socket.join('admin');

    // ---- Match events ----
    socket.on('match:scoreUpdate', (payload) => {
      console.log(`[Socket] match:scoreUpdate`, payload);
      // In a full implementation this would update the DB, then broadcast.
      // For now, relay directly to overlay clients.
      io.to('overlay').emit('match:update', payload as unknown);
      io.to('admin').emit('match:update', payload as unknown);
    });

    socket.on('match:roundUpdate', (payload) => {
      console.log(`[Socket] match:roundUpdate`, payload);
      io.to('overlay').emit('match:update', payload as unknown);
    });

    socket.on('match:statusChange', (payload) => {
      console.log(`[Socket] match:statusChange`, payload);
      io.to('overlay').emit('match:update', payload as unknown);
      io.to('admin').emit('match:update', payload as unknown);
    });

    // ---- BP events ----
    socket.on('bp:ban', (payload) => {
      console.log(`[Socket] bp:ban`, payload);
      io.to('overlay').emit('bp:update', payload as unknown);
      io.to('admin').emit('bp:update', payload as unknown);
    });

    socket.on('bp:pick', (payload) => {
      console.log(`[Socket] bp:pick`, payload);
      io.to('overlay').emit('bp:update', payload as unknown);
      io.to('admin').emit('bp:update', payload as unknown);
    });

    socket.on('bp:undo', (payload) => {
      console.log(`[Socket] bp:undo`, payload);
      io.to('overlay').emit('bp:update', payload as unknown);
      io.to('admin').emit('bp:update', payload as unknown);
    });

    socket.on('bp:reset', (payload) => {
      console.log(`[Socket] bp:reset`, payload);
      io.to('overlay').emit('bp:update', payload as unknown);
      io.to('admin').emit('bp:update', payload as unknown);
    });

    // ---- Overlay control events ----
    socket.on('overlay:toggle', (payload) => {
      console.log(`[Socket] overlay:toggle`, payload);
      io.to('overlay').emit('overlay:update', payload as unknown);
    });

    socket.on('overlay:scene', (payload) => {
      console.log(`[Socket] overlay:scene`, payload);
      io.to('overlay').emit('overlay:update', payload as unknown);
    });

    // ---- Disconnect ----
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
