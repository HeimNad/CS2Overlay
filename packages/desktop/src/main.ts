import { app, BrowserWindow, globalShortcut } from 'electron';
import * as path from 'path';
import { startServer, startWeb, stopAll, waitForReady } from './processes';

// Will be set by tray module
export let mainWindow: BrowserWindow | null = null;

const ADMIN_URL = 'http://localhost:3000/admin/dashboard';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'CS2 Overlay — Admin',
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('close', (e) => {
    if (!(app as unknown as { isQuitting: boolean }).isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });

  return win;
}

async function loadWithRetry(win: BrowserWindow): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await win.loadURL(ADMIN_URL);
      console.log(`[Desktop] Loaded ${ADMIN_URL}`);
      return;
    } catch {
      console.log(`[Desktop] Waiting for Next.js... (attempt ${attempt}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
  console.error('[Desktop] Failed to connect to Next.js after max retries');
  await win.loadURL(`data:text/html,<h2 style="font-family:sans-serif;color:#888;padding:40px">Could not connect to http://localhost:3000<br><small>Make sure pnpm dev:web is running.</small></h2>`);
}

async function startChildProcesses(): Promise<void> {
  const resourcesPath = process.resourcesPath;
  console.log('[Desktop] Starting bundled services...');

  // Start Express server first
  startServer(resourcesPath);
  console.log('[Desktop] Waiting for backend server...');
  await waitForReady('http://localhost:3001/health', 30000);
  console.log('[Desktop] Backend server ready.');

  // Start Next.js standalone
  startWeb(resourcesPath);
  console.log('[Desktop] Waiting for Next.js...');
  await waitForReady('http://localhost:3000', 30000);
  console.log('[Desktop] Next.js ready.');
}

app.whenReady().then(async () => {
  // In production (packaged), start server and web as child processes
  if (app.isPackaged) {
    try {
      await startChildProcesses();
    } catch (e) {
      console.error('[Desktop] Failed to start services:', e);
    }
  }

  mainWindow = createWindow();
  await loadWithRetry(mainWindow);

  // Late-import optional modules (tray, shortcuts, gsi installer)
  try {
    const { setupTray } = await import('./tray');
    setupTray(mainWindow);
  } catch (e) {
    console.warn('[Desktop] Tray setup skipped:', e);
  }

  try {
    const { registerShortcuts } = await import('./shortcuts');
    registerShortcuts(mainWindow);
  } catch (e) {
    console.warn('[Desktop] Shortcuts setup skipped:', e);
  }

  try {
    const { registerGSIInstaller } = await import('./gsiInstaller');
    registerGSIInstaller();
  } catch (e) {
    console.warn('[Desktop] GSI installer setup skipped:', e);
  }
});

app.on('before-quit', async () => {
  if (app.isPackaged) {
    console.log('[Desktop] Stopping child processes...');
    await stopAll();
    console.log('[Desktop] Child processes stopped.');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
