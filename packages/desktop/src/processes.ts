import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as http from 'http';

const children: ChildProcess[] = [];

function spawnChild(
  label: string,
  scriptPath: string,
  env: Record<string, string>,
): ChildProcess {
  // In packaged Electron, process.execPath is the Electron binary.
  // Setting ELECTRON_RUN_AS_NODE=1 makes it behave as plain Node.js.
  const child = spawn(process.execPath, [scriptPath], {
    env: { ...process.env, ...env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (data: Buffer) => {
    const lines = data.toString().trimEnd();
    for (const line of lines.split('\n')) {
      console.log(`[${label}] ${line}`);
    }
  });

  child.stderr?.on('data', (data: Buffer) => {
    const lines = data.toString().trimEnd();
    for (const line of lines.split('\n')) {
      console.error(`[${label}] ${line}`);
    }
  });

  child.on('exit', (code, signal) => {
    console.log(`[${label}] exited (code=${code}, signal=${signal})`);
  });

  children.push(child);
  return child;
}

export function startServer(resourcesPath: string): ChildProcess {
  const serverDir = path.join(resourcesPath, 'bundled', 'server');
  const entry = path.join(serverDir, 'dist', 'index.js');

  return spawnChild('Server', entry, {
    PORT: '3001',
    CORS_ORIGIN: 'http://localhost:3000',
    NODE_ENV: 'production',
  });
}

export function startWeb(resourcesPath: string): ChildProcess {
  const webDir = path.join(resourcesPath, 'bundled', 'web');
  const entry = path.join(webDir, 'packages', 'web', 'server.js');

  return spawnChild('Web', entry, {
    HOSTNAME: 'localhost',
    PORT: '3000',
    NODE_ENV: 'production',
  });
}

export function waitForReady(
  url: string,
  timeout = 30000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function poll() {
      const req = http.get(url, (res) => {
        // Any response (even 404) means the server is up
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', () => {
        retry();
      });

      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() - start > timeout) {
        reject(new Error(`Timeout waiting for ${url}`));
        return;
      }
      setTimeout(poll, 500);
    }

    poll();
  });
}

export function stopAll(): Promise<void> {
  return new Promise((resolve) => {
    const alive = children.filter((c) => c.exitCode === null && !c.killed);

    if (alive.length === 0) {
      resolve();
      return;
    }

    let settled = 0;
    const done = () => {
      settled++;
      if (settled >= alive.length) resolve();
    };

    for (const child of alive) {
      child.once('exit', done);

      // Try graceful shutdown first
      const killed = child.kill('SIGTERM');
      if (!killed) {
        done();
        continue;
      }

      // Force kill after 2 seconds if still alive
      setTimeout(() => {
        if (child.exitCode === null && !child.killed) {
          child.kill('SIGKILL');
        }
      }, 2000);
    }

    // Hard deadline — resolve after 5 seconds regardless
    setTimeout(resolve, 5000);
  });
}
