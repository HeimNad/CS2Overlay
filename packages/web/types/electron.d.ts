export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  platform: string;
  installGSIConfig: () => Promise<{ success: boolean; path?: string; error?: string }>;
  onShortcut: (callback: (action: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
