# CS2 Overlay

CS2 电竞赛事转播覆盖层系统，配合 OBS Studio 进行直播。提供实时比赛画面（计分板、Ban/Pick、选手信息等）及 Admin 后台管理面板。

打包后双击 `CS2 Overlay.exe` 即可使用 —— 后端、前端自动启动，无需手动运行任何命令。

## 功能

- 计分板、Ban/Pick 地图 Veto、选手信息卡、赛事顶栏等多种 Overlay
- 支持 BO1 / BO3 / BO5 赛制
- Admin Dashboard 后台一键控制比分、Ban/Pick、Overlay 可见性
- 场景预设，一键切换
- 所有 Overlay 透明背景，直接用作 OBS Browser Source（1920x1080）
- WebSocket 实时同步，断线自动重连
- CS2 Game State Integration (GSI) 支持

## 架构

```
CS2 Overlay.exe (生产模式)
  Electron 主进程
    ├─ 子进程: Express + Socket.io 后端   (localhost:3001)
    ├─ 子进程: Next.js standalone 前端    (localhost:3000)
    └─ BrowserWindow → http://localhost:3000/admin/dashboard

OBS Browser Source → http://localhost:3000/overlay/*
                         ↕ Socket.io
                     Express 后端 (:3001)
```

### 数据流

```
Admin 操作 → socket.emit() → 服务端验证 + 修改状态 → 广播完整对象 → 所有客户端
                                                                        ↓
                                                            Zustand store 更新 → 组件渲染
```

- **服务端权威状态**：服务端维护 Match / BPSession / OverlayState 三个内存状态管理器，所有变更经服务端处理后广播完整对象
- **客户端只读**：前端 store 仅通过 socket 监听器更新，Admin 操作全部通过 emit 发送
- **新客户端同步**：新连接自动接收当前完整状态

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 状态管理 | Zustand |
| 动画 | Framer Motion |
| 实时通信 | Socket.io |
| 数据验证 | Zod |
| 后端 | Express + Socket.io |
| 桌面端 | Electron 33 + electron-builder |
| 构建 | Turborepo + pnpm workspaces |

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 10

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动所有开发服务（后端 + 前端 + 桌面端窗口）
pnpm dev

# 或分别启动
pnpm dev:server   # Express 后端 → http://localhost:3001
pnpm dev:web      # Next.js 前端 → http://localhost:3000
```

开发模式下 Electron 窗口直接连接 `localhost:3000`，不启动子进程。

启动后访问 http://localhost:3000 查看导航页，或 http://localhost:3000/admin/dashboard 打开管理面板。

## OBS 配置指南

1. 在 OBS 中添加 **Browser Source**
2. URL 填写对应的 Overlay 路由（见下表）
3. 分辨率设为 **1920 x 1080**
4. 勾选 **Shutdown source when not visible** 和 **Refresh browser when scene becomes active**
5. 自定义 CSS 留空（页面自带透明背景）

### Overlay 路由

| Overlay | URL |
|---------|-----|
| 计分板 | `http://localhost:3000/overlay/scoreboard` |
| Ban/Pick | `http://localhost:3000/overlay/bp` |
| 选手信息 | `http://localhost:3000/overlay/lower-third` |
| 赛事顶栏 | `http://localhost:3000/overlay/top-bar` |
| 地图 Veto | `http://localhost:3000/overlay/map-veto` |
| 倒计时 | `http://localhost:3000/overlay/countdown` |
| 回放 | `http://localhost:3000/overlay/replay` |
| 暂停/中场 | `http://localhost:3000/overlay/break` |
| 赞助商 | `http://localhost:3000/overlay/sponsor` |
| 选手摄像头 | `http://localhost:3000/overlay/player-cam` |

### Admin 路由

| 路由 | 说明 |
|------|------|
| `/admin/dashboard` | 总览面板 — 连接状态、比赛比分、BP 进度 |
| `/admin/match-control` | 比赛控制 — 创建比赛、比分 +1/-1、状态切换、重置 |
| `/admin/bp-control` | BP 控制 — 开始 BP 会话、点击地图执行 ban/pick、撤销/重置 |
| `/admin/gsi` | GSI 配置 — CS2 Game State Integration 安装与状态 |
| `/admin/scenes` | 场景管理 — 预设场景、一键切换 |
| `/admin/overlay-toggle` | Overlay 显隐控制 — 显示/隐藏、透明度调节 |

## 使用流程

### 比赛比分控制

1. 打开 `/admin/match-control`
2. 填写双方队伍名称和简称，选择赛制（BO1 / BO3 / BO5），点击 **Create Match**
3. 打开 `/overlay/scoreboard`（或在 OBS 中查看），记分板自动出现
4. 在 Admin 面板点击 **+1 / -1** 调整比分，Overlay 实时更新并播放动画
5. 使用状态按钮切换比赛状态（Upcoming / Live / Finished）
6. 比赛结束后点击 **Reset Match** 清除（需二次确认）

### Ban/Pick 地图 Veto

1. 打开 `/admin/bp-control`
2. 选择赛制（BO1 / BO3 / BO5），点击 **Start BP Session**
3. 打开 `/overlay/bp` 查看 Overlay
4. 在 Admin 面板**点击地图**即可执行操作 — 服务端自动判定当前步骤是 ban 还是 pick、哪个队伍操作
5. 流程时间线实时高亮当前步骤
6. 所有步骤完成后，剩余最后一张地图自动标记为 **DECIDER**
7. 可随时点击 **Undo** 撤销上一步，或 **Reset** 重新开始

#### BP 流程定义

| 赛制 | 流程 |
|------|------|
| BO1 | A ban → B ban → A ban → B ban → A ban → B ban → 剩余 1 图 decider |
| BO3 | A ban → B ban → A pick → B pick → A ban → B ban → 剩余 1 图 decider |
| BO5 | A pick → B pick → A ban → B ban → A pick → B pick → 剩余 1 图 decider |

#### 地图池

Dust2 · Mirage · Inferno · Nuke · Overpass · Vertigo · Ancient

## 打包

### 本地打包

```bash
# 1. 安装依赖（仓库根目录）
pnpm install

# 2. 构建所有包（shared → server + web + desktop）
pnpm build

# 3. 打包 Electron 应用（在 packages/desktop/ 下执行）
cd packages/desktop
pnpm run pack:dir     # 生成免安装版 → release/win-unpacked/CS2 Overlay.exe
pnpm run pack:dist    # 生成安装程序 → release/CS2 Overlay Setup X.X.X.exe
```

`pack:dir` / `pack:dist` 会自动执行 `pnpm bundle`（收集构建产物）然后调用 `electron-builder`。

### 打包流水线

```
pnpm build (turbo，按依赖顺序)
  shared   → packages/shared/dist/            TypeScript 编译
  server   → packages/server/dist/            TypeScript 编译
  web      → packages/web/.next/standalone/   Next.js standalone 输出
  desktop  → packages/desktop/dist/           TypeScript 编译

pnpm bundle (packages/desktop/scripts/bundle.js)
  server → 复制 dist/ + npm install 生产依赖 + 注入 @cs2overlay/shared
  web    → 复制 standalone（解引用符号链接）+ .next/static + public

electron-builder
  bundled/        → extraResources → resources/bundled/
  dist/ + assets/ → app.asar
  输出            → packages/desktop/release/
```

### 产物结构

```
CS2 Overlay.exe
resources/
├── app.asar                       # Electron 主进程代码
└── bundled/
    ├── server/
    │   ├── dist/index.js          # Express 入口
    │   ├── node_modules/          # 生产依赖（扁平，无符号链接）
    │   └── package.json
    └── web/
        └── packages/web/
            ├── server.js          # Next.js standalone 入口
            ├── .next/static/      # 前端静态资源
            ├── public/            # 公共文件
            └── node_modules/
```

## 项目结构

```
cs2overlay/
├── packages/
│   ├── web/                    # Next.js 前端（Overlay 页面 + Admin 面板）
│   │   ├── app/
│   │   │   ├── admin/          #   Admin 控制面板页面
│   │   │   └── overlay/        #   Overlay 页面（OBS Browser Source）
│   │   ├── components/         #   React 组件
│   │   ├── stores/             #   Zustand 状态管理
│   │   ├── lib/                #   Socket 服务、常量、校验
│   │   └── next.config.ts      #   output: 'standalone'
│   ├── server/                 # Express + Socket.io 后端
│   │   └── src/
│   │       ├── index.ts        #   入口（Express + HTTP + Socket.io）
│   │       ├── socket.ts       #   Socket 事件处理
│   │       ├── state.ts        #   GSI 状态管理
│   │       └── routes/         #   路由（GSI 等）
│   ├── shared/                 # 共享 TypeScript 类型与常量
│   │   └── src/types.ts
│   └── desktop/                # Electron 桌面端
│       ├── src/
│       │   ├── main.ts         #   Electron 入口 + 子进程编排
│       │   ├── processes.ts    #   子进程管理（start/stop/waitForReady）
│       │   ├── tray.ts         #   系统托盘
│       │   ├── shortcuts.ts    #   全局快捷键
│       │   └── gsiInstaller.ts #   GSI 配置文件安装
│       ├── scripts/
│       │   └── bundle.js       #   打包脚本（收集构建产物）
│       └── bundled/            #   (构建产物，已 gitignore)
├── turbo.json                  # Turborepo 任务编排
├── tsconfig.base.json          # 共享 TS 编译选项
└── pnpm-workspace.yaml
```

## WebSocket 事件协议

### Client → Server

| 事件 | 载荷 | 说明 |
|------|------|------|
| `match:init` | `{teamAName, teamAShortName, teamBName, teamBShortName, format}` | 创建比赛 |
| `match:scoreUpdate` | `{team: 'A'\|'B', delta: number}` | 更新比分 |
| `match:statusChange` | `{status: 'upcoming'\|'live'\|'finished'}` | 切换比赛状态 |
| `match:reset` | — | 清除比赛 |
| `bp:init` | `{format: 'BO1'\|'BO3'\|'BO5'}` | 开始 BP 会话 |
| `bp:action` | `{map: string}` | 执行 BP 操作（服务端自动判定 ban/pick） |
| `bp:undo` | — | 撤销上一步 |
| `bp:reset` | — | 清除 BP 会话 |
| `overlay:toggle` | `{name: OverlayName, visible: boolean}` | 切换 Overlay 显隐 |
| `state:requestSync` | — | 请求同步当前完整状态 |

### Server → Client

| 事件 | 载荷 | 说明 |
|------|------|------|
| `match:update` | `Match` 完整对象 | 比赛状态变更 |
| `match:cleared` | — | 比赛已清除 |
| `bp:update` | `BPSession` 完整对象 | BP 会话状态变更 |
| `bp:cleared` | — | BP 会话已清除 |
| `overlay:update` | `OverlayState` 完整对象 | Overlay 显隐状态变更 |
| `system:error` | `{code, message}` | 错误通知 |

## 常用命令

```bash
# 开发
pnpm dev              # 启动所有开发服务
pnpm dev:web          # 仅启动前端 → http://localhost:3000
pnpm dev:server       # 仅启动后端 → http://localhost:3001
pnpm build            # 构建所有包
pnpm lint             # ESLint 检查

# 打包（在 packages/desktop/ 下执行）
pnpm bundle           # 收集构建产物到 bundled/
pnpm run pack:dir     # bundle + electron-builder --dir（免安装版）
pnpm run pack:dist    # bundle + electron-builder（安装程序）
```

## License

Private
