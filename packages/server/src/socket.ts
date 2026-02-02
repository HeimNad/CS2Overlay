import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@cs2overlay/shared';
import { MatchStateManager, BPStateManager, OverlayStateManager } from './state';
import type { GSIStateManager } from './state/gsiState';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function initializeSocket(httpServer: HttpServer, corsOrigin: string, gsiState?: GSIStateManager): TypedServer {
  const io: TypedServer = new Server(httpServer, {
    cors: {
      origin: corsOrigin || '*',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const matchState = new MatchStateManager();
  const bpState = new BPStateManager();
  const overlayState = new OverlayStateManager();
  let currentTheme = 'default-dark';

  // GSI heartbeat disconnect → broadcast disconnected state
  if (gsiState) {
    gsiState.onDisconnect(() => {
      const state = gsiState.getState();
      io.to('overlay').emit('gsi:state', state);
      io.to('admin').emit('gsi:state', state);
    });
  }

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join default rooms
    socket.join('overlay');
    socket.join('admin');

    // Sync current state to new client
    const match = matchState.getMatch();
    if (match) {
      socket.emit('match:update', match);
    }
    const session = bpState.getSession();
    if (session) {
      socket.emit('bp:update', session);
    }
    socket.emit('overlay:update', overlayState.getState());
    socket.emit('overlay:themeUpdate', { theme: currentTheme });

    // Sync GSI state
    if (gsiState) {
      const gsi = gsiState.getState();
      if (gsi.isConnected) {
        socket.emit('gsi:state', gsi);
      }
    }

    // ---- State sync request ----
    socket.on('state:requestSync', () => {
      const m = matchState.getMatch();
      if (m) socket.emit('match:update', m);
      const s = bpState.getSession();
      if (s) socket.emit('bp:update', s);
      socket.emit('overlay:update', overlayState.getState());
      socket.emit('overlay:themeUpdate', { theme: currentTheme });
      if (gsiState) {
        socket.emit('gsi:state', gsiState.getState());
      }
    });

    // ---- GSI events ----
    socket.on('gsi:requestState', () => {
      if (gsiState) {
        socket.emit('gsi:state', gsiState.getState());
      }
    });

    // ---- Match events ----
    socket.on('match:init', (payload) => {
      console.log(`[Socket] match:init`, payload);
      const m = matchState.initMatch(
        payload.teamAName,
        payload.teamAShortName,
        payload.teamBName,
        payload.teamBShortName,
        payload.format
      );
      io.to('overlay').emit('match:update', m);
      io.to('admin').emit('match:update', m);
    });

    socket.on('match:scoreUpdate', (payload) => {
      console.log(`[Socket] match:scoreUpdate`, payload);
      const m = matchState.updateScore(payload.team, payload.delta);
      if (m) {
        io.to('overlay').emit('match:update', m);
        io.to('admin').emit('match:update', m);
      } else {
        socket.emit('system:error', { code: 'NO_MATCH', message: 'No active match' });
      }
    });

    socket.on('match:statusChange', (payload) => {
      console.log(`[Socket] match:statusChange`, payload);
      const m = matchState.changeStatus(payload.status);
      if (m) {
        io.to('overlay').emit('match:update', m);
        io.to('admin').emit('match:update', m);
      }
    });

    socket.on('match:reset', () => {
      console.log(`[Socket] match:reset`);
      matchState.reset();
      io.to('overlay').emit('match:cleared');
      io.to('admin').emit('match:cleared');
    });

    socket.on('match:roundUpdate', (payload) => {
      console.log(`[Socket] match:roundUpdate`, payload);
      // Round updates will be expanded later with full map tracking
    });

    // ---- BP events ----
    socket.on('bp:init', (payload) => {
      console.log(`[Socket] bp:init`, payload);
      const match = matchState.getMatch();
      const matchId = match?.id || '';
      const s = bpState.initSession(matchId, payload.format);
      io.to('overlay').emit('bp:update', s);
      io.to('admin').emit('bp:update', s);
    });

    socket.on('bp:action', (payload) => {
      console.log(`[Socket] bp:action`, payload);
      const s = bpState.applyAction(payload.map);
      if (s) {
        io.to('overlay').emit('bp:update', s);
        io.to('admin').emit('bp:update', s);
      } else {
        socket.emit('system:error', { code: 'BP_INVALID', message: 'Invalid BP action' });
      }
    });

    socket.on('bp:ban', (payload) => {
      console.log(`[Socket] bp:ban`, payload);
      const s = bpState.applyAction(payload.map);
      if (s) {
        io.to('overlay').emit('bp:update', s);
        io.to('admin').emit('bp:update', s);
      }
    });

    socket.on('bp:pick', (payload) => {
      console.log(`[Socket] bp:pick`, payload);
      const s = bpState.applyAction(payload.map);
      if (s) {
        io.to('overlay').emit('bp:update', s);
        io.to('admin').emit('bp:update', s);
      }
    });

    socket.on('bp:undo', () => {
      console.log(`[Socket] bp:undo`);
      const s = bpState.undo();
      if (s) {
        io.to('overlay').emit('bp:update', s);
        io.to('admin').emit('bp:update', s);
      }
    });

    socket.on('bp:reset', () => {
      console.log(`[Socket] bp:reset`);
      bpState.reset();
      io.to('overlay').emit('bp:cleared');
      io.to('admin').emit('bp:cleared');
    });

    // ---- Overlay control events ----
    socket.on('overlay:toggle', (payload) => {
      console.log(`[Socket] overlay:toggle`, payload);
      const state = overlayState.toggle(payload.name, payload.visible);
      io.to('overlay').emit('overlay:update', state);
      io.to('admin').emit('overlay:update', state);
    });

    socket.on('overlay:setOpacity', (payload) => {
      console.log(`[Socket] overlay:setOpacity`, payload);
      const state = overlayState.setOpacity(payload.name, payload.opacity);
      io.to('overlay').emit('overlay:update', state);
      io.to('admin').emit('overlay:update', state);
    });

    socket.on('overlay:applyScene', (payload) => {
      console.log(`[Socket] overlay:applyScene`, payload);
      const names = Object.keys(payload.overlays) as Array<keyof typeof payload.overlays>;
      for (const name of names) {
        overlayState.toggle(name, payload.overlays[name]);
      }
      const state = overlayState.getState();
      io.to('overlay').emit('overlay:update', state);
      io.to('admin').emit('overlay:update', state);
    });

    socket.on('overlay:selectPlayer', (payload) => {
      console.log(`[Socket] overlay:selectPlayer`, payload);
      const state = overlayState.setLowerThirdPlayer(payload.player);
      io.to('overlay').emit('overlay:update', state);
      io.to('admin').emit('overlay:update', state);
    });

    socket.on('overlay:scene', (payload) => {
      console.log(`[Socket] overlay:scene`, payload);
      io.to('overlay').emit('overlay:update', overlayState.getState());
    });

    socket.on('overlay:setTheme', (payload) => {
      console.log(`[Socket] overlay:setTheme`, payload);
      currentTheme = payload.theme;
      io.to('overlay').emit('overlay:themeUpdate', { theme: currentTheme });
      io.to('admin').emit('overlay:themeUpdate', { theme: currentTheme });
    });

    // ---- Disconnect ----
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
