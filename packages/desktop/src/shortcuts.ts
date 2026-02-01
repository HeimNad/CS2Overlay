import { globalShortcut, BrowserWindow } from 'electron';

interface ShortcutMapping {
  key: string;
  action: string;
}

const SHORTCUTS: ShortcutMapping[] = [
  { key: 'F1', action: 'toggle:scoreboard' },
  { key: 'F2', action: 'toggle:bp' },
  { key: 'F3', action: 'toggle:topBar' },
  { key: 'F4', action: 'toggle:lowerThird' },
  { key: 'F5', action: 'toggle:mapVeto' },
  { key: 'F9', action: 'window:toggleVisibility' },
];

export function registerShortcuts(mainWindow: BrowserWindow): void {
  for (const { key, action } of SHORTCUTS) {
    const registered = globalShortcut.register(key, () => {
      if (action === 'window:toggleVisibility') {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
        return;
      }

      // Forward overlay toggle shortcuts to the renderer process
      if (mainWindow.webContents) {
        mainWindow.webContents.send('shortcut:action', action);
      }
    });

    if (registered) {
      console.log(`[Shortcuts] Registered ${key} → ${action}`);
    } else {
      console.warn(`[Shortcuts] Failed to register ${key}`);
    }
  }
}
