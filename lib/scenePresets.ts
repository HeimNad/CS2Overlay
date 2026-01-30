import type { OverlayName } from '@/types';

export interface ScenePreset {
  id: string;
  name: string;
  description: string;
  overlays: Record<OverlayName, boolean>;
}

const allOff: Record<OverlayName, boolean> = {
  scoreboard: false,
  bp: false,
  lowerThird: false,
  topBar: false,
  mapVeto: false,
  countdown: false,
  replay: false,
  break: false,
  sponsor: false,
  playerCam: false,
};

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'match-live',
    name: 'Match Live',
    description: 'Scoreboard and top bar for live gameplay',
    overlays: { ...allOff, scoreboard: true, topBar: true },
  },
  {
    id: 'map-veto',
    name: 'Map Veto',
    description: 'Ban/Pick overlay for map selection phase',
    overlays: { ...allOff, bp: true },
  },
  {
    id: 'break',
    name: 'Break',
    description: 'Break screen with sponsor rotation',
    overlays: { ...allOff, break: true, sponsor: true },
  },
  {
    id: 'player-showcase',
    name: 'Player Showcase',
    description: 'Lower third and player camera',
    overlays: { ...allOff, lowerThird: true, playerCam: true },
  },
  {
    id: 'blackout',
    name: 'Blackout',
    description: 'All overlays hidden',
    overlays: { ...allOff },
  },
];
