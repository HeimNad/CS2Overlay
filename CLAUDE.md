# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CS2 esports broadcast overlay system for live streaming with OBS Studio. Displays real-time match graphics (scoreboard, ban/pick, player info, etc.) with an admin control panel for broadcast operators. Documentation is in Chinese (see `docs/Dev_Doc.md`).

## Monorepo Structure

```
cs2overlay/
├── packages/
│   ├── web/        # Next.js Overlay pages + Admin dashboard
│   ├── server/     # Express + Socket.io backend
│   ├── shared/     # Shared TypeScript types and constants
│   └── desktop/    # Electron desktop app (all-in-one packaging)
│       ├── src/           # main.ts, processes.ts, tray, shortcuts, gsi
│       ├── scripts/       # bundle.js (build artifact collector)
│       └── bundled/       # (generated) server + web artifacts for packaging
├── turbo.json      # Turborepo task orchestration
├── tsconfig.base.json  # Shared TS compiler options
└── pnpm-workspace.yaml
```

## Commands

```bash
# Development
pnpm dev              # Start all dev servers (turbo)
pnpm dev:web          # Start Next.js dev server only (http://localhost:3000)
pnpm dev:server       # Start backend dev server only (http://localhost:3001)
pnpm build            # Build all packages (turbo, dependency-aware)
pnpm build:web        # Build frontend only (standalone output)
pnpm build:server     # Build backend only
pnpm build:shared     # Build shared types only
pnpm lint             # Run ESLint across packages
pnpm install          # Install all workspace dependencies

# Desktop packaging (run from packages/desktop/)
pnpm bundle           # Collect build artifacts into bundled/
pnpm run pack:dir     # bundle + electron-builder --dir (unpacked)
pnpm run pack:dist    # bundle + electron-builder (installer)
```

Package manager is **pnpm** (not npm or yarn). Build tool is **Turborepo**.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **State management**: Zustand (stores in `packages/web/stores/`)
- **Animations**: Framer Motion
- **Real-time**: Socket.io-client connecting to Express + Socket.io backend
- **Validation**: Zod
- **Build**: Turborepo + pnpm workspaces
- **Path alias**: `@/*` maps to `packages/web/*` (e.g., `@/components/Scoreboard`)
- **Shared types**: `@cs2overlay/shared` workspace package
- **Desktop**: Electron 33 + electron-builder (all-in-one packaging)

### Planned (not yet installed)
- **Backend/DB**: Prisma ORM, PostgreSQL

## Architecture

### Production (Electron all-in-one)

```
CS2 Overlay.exe
  Electron main process
    ├─ child process: Express server       (localhost:3001)
    ├─ child process: Next.js standalone   (localhost:3000)
    └─ BrowserWindow → http://localhost:3000/admin/dashboard

OBS Browser Sources → http://localhost:3000/overlay/* (transparent, 1920x1080)
                          ↕ Socket.io
                      Express server (:3001)
```

Double-click the exe → backend + frontend auto-start → window shows Admin Dashboard. Quit → all child processes terminate. No manual commands needed.

Child processes use `ELECTRON_RUN_AS_NODE=1` with `child_process.spawn` so the Electron binary acts as a plain Node.js runtime. Build artifacts are packaged via `electron-builder extraResources` into `resources/bundled/`.

### Development

```
pnpm dev:server  → Express (:3001)
pnpm dev:web     → Next.js dev (:3000)
pnpm dev         → (desktop) electron loads localhost:3000 directly, no child processes
```

### Client types

Two client types connect to the backend:
1. **Overlay pages** — read-only browser sources rendered in OBS, receive state updates via WebSocket
2. **Admin dashboard** — control panel that sends commands via WebSocket to update match state

### Route Structure

**Overlay routes** (transparent background, embedded as OBS browser sources):
- `/overlay/scoreboard` — Live scores, team logos, map info, BO series progress
- `/overlay/bp` — Ban/Pick map veto visualization (BO1/BO3/BO5 flows)
- `/overlay/lower-third` — Player info cards (name, country, KDA)
- `/overlay/top-bar` — Event name, match phase, time
- `/overlay/map-veto` — Full veto process result display
- `/overlay/countdown`, `/overlay/replay`, `/overlay/break`, `/overlay/sponsor`, `/overlay/player-cam`

**Admin routes** (control panel UI):
- `/admin/dashboard` — Match overview, connection status, quick actions
- `/admin/match-control` — Score +1/-1, team editing, map/round control
- `/admin/bp-control` — Map pool management, ban/pick operations, presets (BO1/BO3/BO5)
- `/admin/scenes` — Preset scene management, one-click scene switching
- `/admin/overlay-toggle` — Show/hide overlays, opacity control

### Core Data Models

Shared TypeScript interfaces in `packages/shared/src/types.ts`:
- `Match` — format (BO1/BO3/BO5), teams, maps, status
- `Team` — name, shortName, logo, players, score
- `Player` / `PlayerStats` — gameId, realName, country, KDA/ADR/rating
- `BPSession` / `BPAction` — map pool, ban/pick actions, active team, countdown
- `OverlayState` — visibility and opacity per overlay component

### WebSocket Event Protocol

Client → Server: `match:scoreUpdate`, `match:roundUpdate`, `match:statusChange`, `bp:ban`, `bp:pick`, `bp:undo`, `bp:reset`, `overlay:toggle`, `overlay:setOpacity`, `overlay:applyScene`, `overlay:scene`

Server → Client: `match:update`, `bp:update`, `overlay:update`, `player:statsUpdate`, `system:error`, `system:notification`

### Zustand Stores

- `matchStore` — current match state, score updates
- `bpStore` — ban/pick session, action history, undo/redo
- `overlayStore` — overlay visibility/opacity, scene switching
- `socketStore` — WebSocket connection management

### Desktop Packaging

**Bundle pipeline** (`packages/desktop/scripts/bundle.js`):
1. `pnpm build` — builds shared → server + web (Next.js with `output: 'standalone'`)
2. `pnpm bundle` (in desktop/) — collects artifacts into `bundled/`:
   - Server: copies `dist/`, runs `npm install --omit=dev` for flat node_modules (no symlinks), adds `@cs2overlay/shared` manually
   - Web: copies Next.js standalone (with `dereference: true`), `.next/static/`, `public/`
3. `electron-builder` — packages `dist/` + `assets/` into asar, `bundled/` as `extraResources`

**Key files**:
- `packages/desktop/src/processes.ts` — `startServer()`, `startWeb()`, `stopAll()`, `waitForReady()`
- `packages/desktop/src/main.ts` — orchestrates child process lifecycle (`app.isPackaged` guard)
- `packages/desktop/scripts/bundle.js` — build artifact collector
- `packages/web/next.config.ts` — `output: 'standalone'` for self-contained server

**Why `npm install` instead of `pnpm deploy`**: pnpm creates symlinks/junctions with absolute paths on Windows, which break after electron-builder relocates files. `npm install` produces a flat `node_modules` with no symlinks.

## Git Commit Convention

Do NOT add `Co-Authored-By` lines in commits. AI assistance is acknowledged here in CLAUDE.md.

This project is developed with assistance from **Claude Code** (claude.ai/code).

## Design Constraints

- All overlay pages must use **transparent backgrounds** for OBS compositing
- Target resolution: **1920x1080** at **60fps**
- Overlays must handle WebSocket disconnection gracefully with auto-reconnect
- BP system supports three flows: BO1 (6 bans), BO3 (2 ban, 2 pick, 2 ban, 1 decider), BO5 (2 pick, 2 ban, 2 pick, 1 ban)
- All score/state changes must animate smoothly (entry/exit transitions)
