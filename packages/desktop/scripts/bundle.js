/**
 * Bundle script — copies build artifacts into packages/desktop/bundled/
 * so electron-builder can include them as extraResources.
 *
 * Expected to run AFTER `pnpm build` has built shared, server, and web.
 *
 * Layout produced:
 *   bundled/
 *   ├── server/
 *   │   ├── dist/
 *   │   ├── node_modules/  (flat, no symlinks — via npm install)
 *   │   └── package.json
 *   └── web/
 *       ├── packages/web/.next/static/
 *       ├── packages/web/public/
 *       ├── node_modules/   (standalone includes this)
 *       ├── package.json
 *       └── server.js       (Next.js standalone entry)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const DESKTOP = path.resolve(__dirname, '..');
const BUNDLED = path.join(DESKTOP, 'bundled');

const SERVER_PKG = path.join(ROOT, 'packages', 'server');
const WEB_PKG = path.join(ROOT, 'packages', 'web');
const SHARED_PKG = path.join(ROOT, 'packages', 'shared');

// ---------- helpers ----------

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function cpdir(src, dest, dereference = false) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source does not exist: ${src}`);
  }
  fs.cpSync(src, dest, { recursive: true, dereference });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function run(cmd, cwd) {
  console.log(`[bundle] $ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// ---------- main ----------

function bundleServer() {
  console.log('[bundle] Bundling server...');

  const dest = path.join(BUNDLED, 'server');
  ensureDir(dest);

  // Copy compiled output
  cpdir(path.join(SERVER_PKG, 'dist'), path.join(dest, 'dist'));

  // Write a clean package.json with only production dependencies
  // (replace workspace:* reference with a file: path we'll provide)
  const serverPkg = JSON.parse(
    fs.readFileSync(path.join(SERVER_PKG, 'package.json'), 'utf-8'),
  );
  const prodPkg = {
    name: serverPkg.name,
    version: serverPkg.version,
    private: true,
    main: 'dist/index.js',
    dependencies: {},
  };
  // Copy all production deps except the workspace reference
  for (const [name, version] of Object.entries(serverPkg.dependencies || {})) {
    if (name === '@cs2overlay/shared') continue;
    prodPkg.dependencies[name] = version;
  }
  fs.writeFileSync(
    path.join(dest, 'package.json'),
    JSON.stringify(prodPkg, null, 2),
  );

  // Use npm install to get a flat node_modules with no symlinks.
  // pnpm deploy creates symlinks/junctions that break on Windows after
  // relocation by electron-builder.
  console.log('[bundle] Installing server production dependencies (npm)...');
  run('npm install --omit=dev', dest);

  // Manually add @cs2overlay/shared (was a workspace dep, not on npm)
  const sharedDest = path.join(dest, 'node_modules', '@cs2overlay', 'shared');
  ensureDir(sharedDest);
  cpdir(path.join(SHARED_PKG, 'dist'), path.join(sharedDest, 'dist'));
  fs.copyFileSync(
    path.join(SHARED_PKG, 'package.json'),
    path.join(sharedDest, 'package.json'),
  );

  console.log('[bundle] Server done.');
}

function bundleWeb() {
  console.log('[bundle] Copying Next.js standalone...');

  const standaloneRoot = path.join(WEB_PKG, '.next', 'standalone');
  if (!fs.existsSync(standaloneRoot)) {
    throw new Error(
      'Next.js standalone output not found. Make sure next.config.ts has output: "standalone" and run pnpm build:web first.',
    );
  }

  const dest = path.join(BUNDLED, 'web');

  // Copy the entire standalone directory, dereferencing symlinks so the
  // output is fully self-contained (no symlinks that break after packaging).
  cpdir(standaloneRoot, dest, true);

  // Copy static assets — standalone doesn't include .next/static
  const staticSrc = path.join(WEB_PKG, '.next', 'static');
  const staticDest = path.join(dest, 'packages', 'web', '.next', 'static');
  if (fs.existsSync(staticSrc)) {
    ensureDir(path.dirname(staticDest));
    cpdir(staticSrc, staticDest, true);
  } else {
    console.warn('[bundle] WARN: .next/static not found');
  }

  // Copy public/ directory
  const publicSrc = path.join(WEB_PKG, 'public');
  const publicDest = path.join(dest, 'packages', 'web', 'public');
  if (fs.existsSync(publicSrc)) {
    ensureDir(path.dirname(publicDest));
    cpdir(publicSrc, publicDest, true);
  }

  console.log('[bundle] Web done.');
}

// ---------- run ----------

console.log('[bundle] Cleaning bundled/...');
rmrf(BUNDLED);
ensureDir(BUNDLED);

bundleServer();
bundleWeb();

console.log('[bundle] All done! Output in packages/desktop/bundled/');
