import { create } from 'zustand';
import type { BPSession, BPAction, BPPhase, TeamSide } from '@/types';

interface BPStore {
  session: BPSession | null;
  history: BPAction[];

  setSession: (session: BPSession) => void;
  ban: (team: TeamSide, map: string) => void;
  pick: (team: TeamSide, map: string) => void;
  undo: () => void;
  reset: () => void;

  // Helpers
  getBannedMaps: () => BPAction[];
  getPickedMaps: () => BPAction[];
  getRemainingMaps: () => string[];
  getMapAction: (mapName: string) => BPAction | undefined;
  getDeciderMap: () => string | null;
}

export const useBPStore = create<BPStore>((set, get) => ({
  session: null,
  history: [],

  setSession: (session) =>
    set({ session, history: session.actions }),

  ban: (team, map) =>
    set((state) => {
      if (!state.session) return state;
      const action: BPAction = {
        id: crypto.randomUUID(),
        sessionId: state.session.id,
        type: 'ban',
        team,
        map,
        order: state.session.actions.length,
        timestamp: new Date().toISOString(),
      };
      return {
        session: {
          ...state.session,
          actions: [...state.session.actions, action],
        },
        history: [...state.history, action],
      };
    }),

  pick: (team, map) =>
    set((state) => {
      if (!state.session) return state;
      const action: BPAction = {
        id: crypto.randomUUID(),
        sessionId: state.session.id,
        type: 'pick',
        team,
        map,
        order: state.session.actions.length,
        timestamp: new Date().toISOString(),
      };
      return {
        session: {
          ...state.session,
          actions: [...state.session.actions, action],
        },
        history: [...state.history, action],
      };
    }),

  undo: () =>
    set((state) => {
      if (!state.session || state.session.actions.length === 0) return state;
      const actions = state.session.actions.slice(0, -1);
      return {
        session: {
          ...state.session,
          actions,
        },
      };
    }),

  reset: () => set({ session: null, history: [] }),

  getBannedMaps: () => {
    const session = get().session;
    if (!session) return [];
    return session.actions.filter((a) => a.type === 'ban');
  },

  getPickedMaps: () => {
    const session = get().session;
    if (!session) return [];
    return session.actions.filter((a) => a.type === 'pick');
  },

  getRemainingMaps: () => {
    const session = get().session;
    if (!session) return [];
    const usedMaps = new Set(session.actions.map((a) => a.map));
    return session.mapPool.filter((m) => !usedMaps.has(m));
  },

  getMapAction: (mapName: string) => {
    const session = get().session;
    if (!session) return undefined;
    return session.actions.find((a) => a.map === mapName);
  },

  getDeciderMap: () => {
    const session = get().session;
    if (!session || session.status !== 'completed') return null;
    const usedMaps = new Set(session.actions.map((a) => a.map));
    const remaining = session.mapPool.filter((m) => !usedMaps.has(m));
    return remaining.length === 1 ? remaining[0] : null;
  },
}));
