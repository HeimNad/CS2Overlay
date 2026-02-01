import { socketService } from '@/lib/socket';
import { useMatchStore } from '@/stores/matchStore';
import { useBPStore } from '@/stores/bpStore';
import { useOverlayStore } from '@/stores/overlayStore';
import { useGSIStore } from '@/stores/gsiStore';

let listenersSetUp = false;

export function setupSocketListeners() {
  if (listenersSetUp) return;
  listenersSetUp = true;

  socketService.on('match:update', (match) => {
    useMatchStore.getState().setCurrentMatch(match);
  });

  socketService.on('match:cleared', () => {
    useMatchStore.getState().reset();
  });

  socketService.on('bp:update', (session) => {
    useBPStore.getState().setSession(session);
  });

  socketService.on('bp:cleared', () => {
    useBPStore.getState().reset();
  });

  socketService.on('overlay:update', (state) => {
    useOverlayStore.getState().setState(state);
  });

  socketService.on('gsi:state', (state) => {
    useGSIStore.getState().setGSIState(state);
  });

  socketService.on('gsi:roundEnd', (payload) => {
    console.log(`[GSI] Round ${payload.round} won by ${payload.winTeam}`);
  });

  socketService.on('gsi:mapEnd', (payload) => {
    console.log(`[GSI] Map ${payload.mapName} ended: CT ${payload.ctScore} - T ${payload.tScore}`);
  });
}
