import { create } from 'zustand';
import type { GSIState, GSIProcessedPlayer } from '@/types';

const defaultGSIState: GSIState = {
  isConnected: false,
  mapName: '',
  mapPhase: 'warmup',
  round: 0,
  roundPhase: 'freezetime',
  ctScore: 0,
  tScore: 0,
  ctConsecutiveLosses: 0,
  tConsecutiveLosses: 0,
  ctTimeoutsRemaining: 1,
  tTimeoutsRemaining: 1,
  bomb: null,
  players: [],
  phaseCountdown: null,
  timestamp: 0,
};

interface GSIStore {
  gsiState: GSIState;
  setGSIState: (state: GSIState) => void;
  reset: () => void;
  getPlayersByTeam: (team: 'CT' | 'T') => GSIProcessedPlayer[];
  getTeamScore: (team: 'CT' | 'T') => number;
  getCurrentMapName: () => string;
}

export const useGSIStore = create<GSIStore>((set, get) => ({
  gsiState: defaultGSIState,

  setGSIState: (state) => set({ gsiState: state }),

  reset: () => set({ gsiState: defaultGSIState }),

  getPlayersByTeam: (team) => {
    return get().gsiState.players.filter((p) => p.team === team);
  },

  getTeamScore: (team) => {
    const s = get().gsiState;
    return team === 'CT' ? s.ctScore : s.tScore;
  },

  getCurrentMapName: () => {
    return get().gsiState.mapName;
  },
}));
