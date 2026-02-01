import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Window control
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // Platform info
  platform: process.platform,

  // GSI config installer
  installGSIConfig: () => ipcRenderer.invoke('gsi:installConfig'),

  // Shortcut listener — main process sends shortcut actions to renderer
  onShortcut: (callback: (action: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => callback(action);
    ipcRenderer.on('shortcut:action', handler);
    return () => {
      ipcRenderer.removeListener('shortcut:action', handler);
    };
  },
});
