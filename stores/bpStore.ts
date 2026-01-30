import { create } from 'zustand';
import type { BPSession, BPAction, TeamSide } from '@/types';

interface BPStore {
  session: BPSession | null;
  history: BPAction[];

  setSession: (session: BPSession) => void;
  ban: (team: TeamSide, map: string) => void;
  pick: (team: TeamSide, map: string) => void;
  undo: () => void;
  reset: () => void;
}

export const useBPStore = create<BPStore>((set) => ({
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
}));
