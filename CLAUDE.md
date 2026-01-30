# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CS2 esports broadcast overlay system for live streaming with OBS Studio. Displays real-time match graphics (scoreboard, ban/pick, player info, etc.) with an admin control panel for broadcast operators. Documentation is in Chinese (see `docs/Dev_Doc.md`).

## Commands

```bash
pnpm dev        # Start Next.js dev server (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm install    # Install dependencies
```

Package manager is **pnpm** (not npm or yarn).

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Path alias**: `@/*` maps to project root (e.g., `@/components/Scoreboard`)

### Planned (not yet installed)
- **State management**: Zustand (stores in `stores/`)
- **Animations**: Framer Motion (GPU-accelerated, required for overlay transitions)
- **Real-time**: Socket.io-client connecting to Express + Socket.io backend
- **Validation**: Zod
- **Backend/DB**: Express, Prisma ORM, PostgreSQL

## Architecture

```
OBS Browser Sources → Overlay Pages (Next.js, transparent bg, 1920x1080)
                          ↕ Socket.io (real-time)
                      Backend Server (Express)
                          ↕
Admin Dashboard ──────→ Backend Server → Database
```

Two client types connect to the backend:
1. **Overlay pages** — read-only browser sources rendered in OBS, receive state updates via WebSocket
2. **Admin dashboard** — control panel that sends commands via WebSocket to update match state

### Planned Route Structure

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

Key TypeScript interfaces (defined in `docs/Dev_Doc.md`, to be implemented in `types/`):
- `Match` — format (BO1/BO3/BO5), teams, maps, status
- `Team` — name, shortName, logo, players, score
- `Player` / `PlayerStats` — gameId, realName, country, KDA/ADR/rating
- `BPSession` / `BPAction` — map pool, ban/pick actions, active team, countdown
- `OverlayState` — visibility and opacity per overlay component

### WebSocket Event Protocol

Client → Server: `match:scoreUpdate`, `match:roundUpdate`, `match:statusChange`, `bp:ban`, `bp:pick`, `bp:undo`, `bp:reset`, `overlay:toggle`, `overlay:scene`

Server → Client: `match:update`, `bp:update`, `overlay:update`, `player:statsUpdate`, `system:error`, `system:notification`

### Planned Zustand Stores

- `matchStore` — current match state, score updates
- `bpStore` — ban/pick session, action history, undo/redo
- `overlayStore` — overlay visibility/opacity, scene switching
- `socketStore` — WebSocket connection management

## Git Commit Convention

Do NOT add `Co-Authored-By` lines in commits. AI assistance is acknowledged here in CLAUDE.md.

This project is developed with assistance from **Claude Code** (claude.ai/code).

## Design Constraints

- All overlay pages must use **transparent backgrounds** for OBS compositing
- Target resolution: **1920x1080** at **60fps**
- Overlays must handle WebSocket disconnection gracefully with auto-reconnect
- BP system supports three flows: BO1 (6 bans), BO3 (2 ban, 2 pick, 2 ban, 1 decider), BO5 (2 pick, 2 ban, 2 pick, 1 ban)
- All score/state changes must animate smoothly (entry/exit transitions)
