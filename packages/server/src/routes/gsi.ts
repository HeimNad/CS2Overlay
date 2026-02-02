import { Router } from 'express';
import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  GSIPayload,
  GSIState,
} from '@cs2overlay/shared';
import type { GSIStateManager } from '../state/gsiState';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function createGSIRouter(gsiState: GSIStateManager, io: TypedServer): Router {
  const router = Router();

  // Throttle state broadcasts to ~4/sec (250ms)
  let lastBroadcastTime = 0;
  let pendingState: GSIState | null = null;
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;

  function broadcastState(state: GSIState) {
    pendingState = null;
    lastBroadcastTime = Date.now();
    io.to('overlay').emit('gsi:state', state);
    io.to('admin').emit('gsi:state', state);
  }

  router.post('/gsi', (req, res) => {
    const payload = req.body as GSIPayload;

    console.log(`[GSI] POST /gsi received — keys: ${Object.keys(payload).join(', ')}`);

    // Auth validation
    if (!gsiState.validateAuth(payload)) {
      console.log('[GSI] Auth failed — token mismatch');
      res.sendStatus(401);
      return;
    }

    const { state, roundEnd, mapEnd } = gsiState.processPayload(payload);

    console.log(`[GSI] Map: ${state.mapName || 'N/A'}, Round: ${state.round}, Phase: ${state.mapPhase}, Players: ${state.players.length}`);

    // Broadcast specialized events immediately (no throttle)
    if (roundEnd) {
      io.to('overlay').emit('gsi:roundEnd', roundEnd);
      io.to('admin').emit('gsi:roundEnd', roundEnd);
    }

    if (mapEnd) {
      io.to('overlay').emit('gsi:mapEnd', mapEnd);
      io.to('admin').emit('gsi:mapEnd', mapEnd);
    }

    // Throttle regular state broadcasts (roundEnd/mapEnd bypass throttle)
    if (roundEnd || mapEnd) {
      if (throttleTimer) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      broadcastState(state);
    } else {
      const now = Date.now();
      const elapsed = now - lastBroadcastTime;
      if (elapsed >= 250) {
        if (throttleTimer) {
          clearTimeout(throttleTimer);
          throttleTimer = null;
        }
        broadcastState(state);
      } else {
        pendingState = state;
        if (!throttleTimer) {
          throttleTimer = setTimeout(() => {
            throttleTimer = null;
            if (pendingState) {
              broadcastState(pendingState);
            }
          }, 250 - elapsed);
        }
      }
    }

    res.sendStatus(200);
  });

  return router;
}
