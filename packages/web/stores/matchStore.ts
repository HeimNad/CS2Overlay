import { create } from 'zustand';
import type { Match, TeamSide } from '@/types';

interface MatchStore {
  currentMatch: Match | null;
  matches: Match[];
  loading: boolean;
  error: string | null;

  setCurrentMatch: (match: Match) => void;
  updateScore: (team: TeamSide, delta: number) => void;
  setMatches: (matches: Match[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMatchStore = create<MatchStore>((set) => ({
  currentMatch: null,
  matches: [],
  loading: false,
  error: null,

  setCurrentMatch: (match) => set({ currentMatch: match, error: null }),

  updateScore: (team, delta) =>
    set((state) => {
      if (!state.currentMatch) return state;
      const key = team === 'A' ? 'teamA' : 'teamB';
      return {
        currentMatch: {
          ...state.currentMatch,
          [key]: {
            ...state.currentMatch[key],
            score: Math.max(0, state.currentMatch[key].score + delta),
          },
        },
      };
    }),

  setMatches: (matches) => set({ matches }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ currentMatch: null, matches: [], loading: false, error: null }),
}));
