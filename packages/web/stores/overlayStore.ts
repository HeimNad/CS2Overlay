import { create } from 'zustand';
import type { OverlayState, OverlayName } from '@/types';

const defaultComponentState = { visible: true, opacity: 1 };

const defaultOverlayState: OverlayState = {
  scoreboard: { ...defaultComponentState },
  bp: { ...defaultComponentState },
  lowerThird: { ...defaultComponentState },
  topBar: { ...defaultComponentState },
  mapVeto: { ...defaultComponentState },
  countdown: { ...defaultComponentState },
  replay: { ...defaultComponentState },
  break: { ...defaultComponentState },
  sponsor: { ...defaultComponentState },
  playerCam: { ...defaultComponentState },
};

interface OverlayStore {
  states: OverlayState;
  currentScene: string | null;

  toggle: (name: OverlayName, visible: boolean) => void;
  setOpacity: (name: OverlayName, opacity: number) => void;
  switchScene: (sceneId: string) => void;
  setState: (states: OverlayState) => void;
  reset: () => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  states: { ...defaultOverlayState },
  currentScene: null,

  toggle: (name, visible) =>
    set((state) => ({
      states: {
        ...state.states,
        [name]: { ...state.states[name], visible },
      },
    })),

  setOpacity: (name, opacity) =>
    set((state) => ({
      states: {
        ...state.states,
        [name]: { ...state.states[name], opacity: Math.max(0, Math.min(1, opacity)) },
      },
    })),

  switchScene: (sceneId) => set({ currentScene: sceneId }),

  setState: (states) => set({ states }),

  reset: () => set({ states: { ...defaultOverlayState }, currentScene: null }),
}));
