import { app, Tray, Menu, nativeImage, BrowserWindow, shell } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

export function setupTray(mainWindow: BrowserWindow): void {
  // Create a simple 16x16 tray icon (fallback if no icon file exists)
  let icon: Electron.NativeImage;
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      icon = createFallbackIcon();
    }
  } catch {
    icon = createFallbackIcon();
  }

  tray = new Tray(icon);
  tray.setToolTip('CS2 Overlay');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Open Overlay in Browser',
      click: () => {
        shell.openExternal('http://localhost:3000/overlay/scoreboard');
      },
    },
    { type: 'separator' },
    {
      label: 'Auto Launch',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (menuItem) => {
        app.setLoginItemSettings({ openAtLogin: menuItem.checked });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        (app as unknown as { isQuitting: boolean }).isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click to restore window
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

function createFallbackIcon(): Electron.NativeImage {
  // Create a simple 16x16 colored square as fallback
  return nativeImage.createFromBuffer(Buffer.alloc(0));
}
