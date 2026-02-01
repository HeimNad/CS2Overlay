import { Router } from 'express';
import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  GSIPayload,
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

    // Broadcast state to overlay and admin rooms
    io.to('overlay').emit('gsi:state', state);
    io.to('admin').emit('gsi:state', state);

    // Broadcast specialized events
    if (roundEnd) {
      io.to('overlay').emit('gsi:roundEnd', roundEnd);
      io.to('admin').emit('gsi:roundEnd', roundEnd);
    }

    if (mapEnd) {
      io.to('overlay').emit('gsi:mapEnd', mapEnd);
      io.to('admin').emit('gsi:mapEnd', mapEnd);
    }

    res.sendStatus(200);
  });

  return router;
}
