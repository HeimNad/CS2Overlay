# CS2 Overlay System

CS2 电竞赛事直播 overlay 系统，配合 OBS Studio 使用。通过 Admin 控制面板实时操控比赛数据，Overlay 页面以透明背景嵌入 OBS Browser Source 进行直播画面合成。

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装

```bash
# 前端依赖
pnpm install

# 服务端依赖
cd server && pnpm install
```

### 启动

需要同时运行服务端和前端，开两个终端：

```bash
# 终端 1 — 启动服务端（端口 3001）
cd server
pnpm dev

# 终端 2 — 启动前端（端口 3000）
pnpm dev
```

启动后访问 http://localhost:3000 查看导航页。

## 架构

```
OBS Browser Source (1920x1080, 透明背景)
         ↓
   Overlay 页面 (Next.js)
         ↕ Socket.io (实时通信)
Admin 控制面板 (Next.js) → Express 服务端 (端口 3001)
                                ↓
                          内存状态管理
```

### 数据流

```
Admin 操作 → socket.emit() → 服务端验证 + 修改状态 → 广播完整对象 → 所有客户端
                                                                        ↓
                                                            Zustand store 更新 → 组件渲染
```

- **服务端权威状态**：服务端维护 Match / BPSession / OverlayState 三个内存状态管理器，所有变更经服务端处理后广播完整对象
- **客户端只读**：前端 store 仅通过 socket 监听器更新，admin 操作全部通过 emit 发送
- **新客户端同步**：新连接自动接收当前完整状态

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 状态管理 | Zustand |
| 动画 | Framer Motion |
| 实时通信 | Socket.io |
| 数据验证 | Zod |
| 服务端 | Express + Socket.io |
| 包管理器 | pnpm |

## 页面路由

### Admin 控制面板

| 路由 | 说明 |
|------|------|
| `/admin/dashboard` | 总览面板 — 服务器连接状态、当前比赛比分、BP 会话进度、活跃 overlay 数量 |
| `/admin/match-control` | 比赛控制 — 创建比赛（填写双方队名 + 选择赛制）、比分 +1/-1 控制、比赛状态切换、重置 |
| `/admin/bp-control` | BP 控制 — 开始 BP 会话（选择赛制）、点击地图执行 ban/pick（服务端自动判定操作类型和队伍）、流程时间线、撤销/重置 |
| `/admin/scenes` | 场景管理（待实现） |
| `/admin/overlay-toggle` | Overlay 显隐控制（待实现） |

### Overlay 页面（OBS Browser Source）

所有 overlay 页面固定 1920x1080 分辨率、透明背景，可直接作为 OBS Browser Source 嵌入。

| 路由 | 说明 | 状态 |
|------|------|------|
| `/overlay/scoreboard` | 记分板 — 队伍名、比分（带 scale pulse 动画）、赛制、系列赛进度，从顶部弹性滑入 | 已实现 |
| `/overlay/bp` | Ban/Pick — 7 张地图卡片 stagger 进场、ban 红色遮罩、pick 绿色高亮、decider 金色边框、当前操作队伍指示 | 已实现 |
| `/overlay/lower-third` | 选手信息卡 | 待实现 |
| `/overlay/top-bar` | 顶部信息栏 | 待实现 |
| `/overlay/map-veto` | 完整 Veto 结果展示 | 待实现 |
| `/overlay/countdown` | 倒计时 | 待实现 |
| `/overlay/replay` | 回放标识 | 待实现 |
| `/overlay/break` | 暂停画面 | 待实现 |
| `/overlay/sponsor` | 赞助商展示 | 待实现 |
| `/overlay/player-cam` | 选手摄像头框 | 待实现 |

## OBS 配置指南

1. 在 OBS 中添加 **Browser Source**
2. URL 填写对应的 overlay 路由，例如 `http://localhost:3000/overlay/scoreboard`
3. 分辨率设为 **1920 x 1080**
4. 勾选 **Shutdown source when not visible** 和 **Refresh browser when scene becomes active**
5. 自定义 CSS 留空（页面自带透明背景）

## 使用流程

### 比赛比分控制

1. 打开 `/admin/match-control`
2. 填写双方队伍名称和简称，选择赛制（BO1 / BO3 / BO5），点击 **Create Match**
3. 打开 `/overlay/scoreboard`（或在 OBS 中查看），记分板自动出现
4. 在 Admin 面板点击 **+1 / -1** 调整比分，overlay 实时更新并播放动画
5. 使用状态按钮切换比赛状态（Upcoming / Live / Finished）
6. 比赛结束后点击 **Reset Match** 清除（需二次确认）

### Ban/Pick 地图 Veto

1. 打开 `/admin/bp-control`
2. 选择赛制（BO1 / BO3 / BO5），点击 **Start BP Session**
3. 打开 `/overlay/bp` 查看 overlay
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

### 地图池

当前使用的 CS2 竞技地图池：

Dust2 · Mirage · Inferno · Nuke · Overpass · Vertigo · Ancient

## 项目结构

```
cs2overlay/
├── app/                          # Next.js App Router 页面
│   ├── admin/                    # Admin 控制面板
│   │   ├── layout.tsx            #   侧边栏布局 + 连接状态
│   │   ├── dashboard/page.tsx    #   总览面板
│   │   ├── match-control/page.tsx#   比赛控制
│   │   ├── bp-control/page.tsx   #   BP 控制
│   │   ├── scenes/page.tsx       #   场景管理（待实现）
│   │   └── overlay-toggle/page.tsx#  显隐控制（待实现）
│   ├── overlay/                  # Overlay 页面（OBS Browser Source）
│   │   ├── layout.tsx            #   1920x1080 透明容器 + socket 连接
│   │   ├── scoreboard/page.tsx   #   记分板
│   │   ├── bp/page.tsx           #   Ban/Pick
│   │   └── .../                  #   其余 overlay（待实现）
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页导航
├── components/
│   ├── overlays/
│   │   ├── Scoreboard.tsx        # 记分板 overlay 组件
│   │   └── BPOverlay.tsx         # BP overlay 组件
│   └── admin/
│       ├── MatchControl.tsx      # 比赛控制面板组件
│       └── BPControl.tsx         # BP 控制面板组件
├── stores/                       # Zustand 状态管理
│   ├── matchStore.ts             # 比赛状态
│   ├── bpStore.ts                # BP 状态 + 辅助方法
│   ├── overlayStore.ts           # Overlay 显隐 / 透明度
│   └── socketStore.ts            # Socket 连接管理
├── lib/
│   ├── socket.ts                 # SocketService 单例（类型安全的 emit/on）
│   ├── socketListeners.ts        # 集中式 socket 事件 → store 映射
│   ├── constants.ts              # 地图池、地图颜色常量
│   └── validation.ts             # Zod 验证 schema
├── types/
│   └── index.ts                  # 全部 TypeScript 类型定义
├── server/                       # Express 服务端
│   └── src/
│       ├── index.ts              # 入口（Express + HTTP + Socket.io）
│       ├── socket.ts             # Socket 事件处理（验证 → 状态变更 → 广播）
│       ├── types.ts              # 服务端类型定义
│       └── state/                # 服务端状态管理
│           ├── matchState.ts     # MatchStateManager
│           ├── bpState.ts        # BPStateManager
│           ├── overlayState.ts   # OverlayStateManager
│           ├── bpFlows.ts        # BO1/BO3/BO5 流程定义
│           └── index.ts
└── CLAUDE.md                     # Claude Code 开发指南
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
| `overlay:toggle` | `{name: OverlayName, visible: boolean}` | 切换 overlay 显隐 |
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
pnpm dev                   # 启动前端开发服务器
pnpm build                 # 前端生产构建
pnpm lint                  # ESLint 检查
cd server && pnpm dev      # 启动服务端开发服务器
cd server && pnpm build    # 服务端 TypeScript 编译
```
