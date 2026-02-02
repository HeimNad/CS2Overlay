import { socketService } from '@/lib/socket';
import { useMatchStore } from '@/stores/matchStore';
import { useBPStore } from '@/stores/bpStore';
import { useOverlayStore } from '@/stores/overlayStore';
import { useGSIStore } from '@/stores/gsiStore';
import { useThemeStore } from '@/stores/themeStore';
import type { OverlayThemeId } from '@/stores/themeStore';

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

  socketService.on('overlay:themeUpdate', (payload) => {
    useThemeStore.getState().setTheme(payload.theme as OverlayThemeId);
  });
}

export function teardownSocketListeners() {
  socketService.off('match:update');
  socketService.off('match:cleared');
  socketService.off('bp:update');
  socketService.off('bp:cleared');
  socketService.off('overlay:update');
  socketService.off('gsi:state');
  socketService.off('gsi:roundEnd');
  socketService.off('gsi:mapEnd');
  socketService.off('overlay:themeUpdate');
  listenersSetUp = false;
}
