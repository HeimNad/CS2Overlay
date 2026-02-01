import { ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const GSI_CONFIG_CONTENT = `"CS2 Overlay GSI"
{
    "uri"           "http://localhost:3001/gsi"
    "timeout"       "5.0"
    "buffer"        "0.1"
    "throttle"      "0.1"
    "heartbeat"     "30.0"
    "auth"
    {
        "token"     "cs2overlay_secret_token"
    }
    "data"
    {
        "provider"              "1"
        "map"                   "1"
        "round"                 "1"
        "player_id"             "1"
        "allplayers_id"         "1"
        "allplayers_state"      "1"
        "allplayers_match_stats" "1"
        "allplayers_weapons"    "1"
        "allplayers_position"   "1"
        "phase_countdowns"      "1"
        "bomb"                  "1"
    }
}
`;

const GSI_FILENAME = 'gamestate_integration_cs2overlay.cfg';

export function registerGSIInstaller(): void {
  ipcMain.handle('gsi:installConfig', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select CS2 cfg Directory',
        properties: ['openDirectory'],
        message: 'Select the CS2 cfg folder (e.g., Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg)',
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Cancelled' };
      }

      const cfgDir = result.filePaths[0];

      // Validate: directory should be named 'cfg' or contain typical CS2 cfg files
      const dirName = path.basename(cfgDir);
      if (dirName !== 'cfg') {
        // Warn but still allow
        console.warn(`[GSI Installer] Selected directory is not named 'cfg': ${cfgDir}`);
      }

      const destPath = path.join(cfgDir, GSI_FILENAME);
      fs.writeFileSync(destPath, GSI_CONFIG_CONTENT, 'utf-8');

      console.log(`[GSI Installer] Config written to ${destPath}`);
      return { success: true, path: destPath };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[GSI Installer] Error:', message);
      return { success: false, error: message };
    }
  });
}
