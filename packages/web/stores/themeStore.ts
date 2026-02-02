import { create } from 'zustand';

export type OverlayThemeId = 'default-dark' | 'blue-neon' | 'red-aggressive' | 'clean-white' | 'green-matrix';

export interface ThemePreset {
  id: OverlayThemeId;
  name: string;
  description: string;
  previewColor: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'default-dark', name: 'Default Dark', description: 'Classic dark overlay', previewColor: '#000000' },
  { id: 'blue-neon', name: 'Blue Neon', description: 'Deep blue with neon glow', previewColor: '#0a0f28' },
  { id: 'red-aggressive', name: 'Red Aggressive', description: 'Dark red with bold accents', previewColor: '#1e0505' },
  { id: 'clean-white', name: 'Clean White', description: 'White translucent with dark text', previewColor: '#ffffff' },
  { id: 'green-matrix', name: 'Green Matrix', description: 'Deep green with emerald glow', previewColor: '#000f05' },
];

interface ThemeStore {
  currentTheme: OverlayThemeId;
  setTheme: (theme: OverlayThemeId) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: 'default-dark',
  setTheme: (theme) => set({ currentTheme: theme }),
}));
