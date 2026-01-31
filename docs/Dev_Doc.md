# CS2 Major级别赛事直播Overlay系统 - 完整项目文档

## 📋 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [功能需求](#功能需求)
4. [开发计划](#开发计划)
5. [技术选型](#技术选型)
6. [系统设计](#系统设计)
7. [实现细节](#实现细节)
8. [部署指南](#部署指南)
9. [使用手册](#使用手册)
10. [附录](#附录)

---

## 项目概述

### 项目目标
开发一套完整的CS2赛事直播Overlay系统，支持比分显示、BP流程、选手信息等所有赛事所需的图形叠加层，并提供完整的后台控制面板。

### 核心特性
- ✅ 实时比分更新
- ✅ BP（Ban/Pick）系统
- ✅ 多种Overlay场景
- ✅ 可视化控制面板
- ✅ OBS浏览器源集成
- ✅ 动画效果支持
- ✅ 主题自定义

### 目标用户
- 赛事主办方
- 直播导播
- 赛事数据员
- 内容创作者

---

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                           OBS Studio                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Browser Src  │  │ Browser Src  │  │ Browser Src  │             │
│  │  Scoreboard  │  │     BP       │  │ Lower-third  │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ WebSocket
          ┌──────────────────┴──────────────────┐
          │                                     │
┌─────────▼─────────┐              ┌───────────▼──────────────────────┐
│   Frontend Web    │              │   Electron Desktop App           │
│  (Overlay Pages)  │              │   ┌──────────────────────────┐  │
│                   │              │   │   Admin Dashboard        │  │
│  - React/Next.js  │◄─────────────┤   │   - Match Control        │  │
│  - TypeScript     │   Commands   │   │   - BP Control           │  │
│  - Framer Motion  │              │   │   - GSI Monitor          │  │
│                   │              │   └──────────────────────────┘  │
└─────────┬─────────┘              └──────────┬───────────────────────┘
          │                                   │
          └──────────────┬────────────────────┘
                         │ Socket.io
              ┌──────────▼──────────┐
              │   Backend Server    │         ┌──────────────────┐
              │                     │         │   CS2 Game       │
              │  - Node.js/Express  │◄────────┤   GSI Server     │
              │  - Socket.io        │  HTTP   │   (localhost)    │
              │  - GSI Integration  │         └──────────────────┘
              │  - REST API         │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │     Database        │
              │  PostgreSQL/MongoDB │
              └─────────────────────┘

              Monorepo Structure:
              ├─ packages/
              │  ├─ web/          (Next.js Overlays)
              │  ├─ desktop/      (Electron App)
              │  ├─ server/       (Backend + GSI)
              │  └─ shared/       (共享类型和工具)
```

### 技术栈

#### 前端
- **框架**: Next.js 14 + TypeScript
- **状态管理**: Zustand
- **动画**: Framer Motion
- **样式**: Tailwind CSS
- **WebSocket**: Socket.io-client
- **图表**: Recharts (可选)

#### 后端
- **运行时**: Node.js 18+
- **框架**: Express
- **WebSocket**: Socket.io
- **GSI**: 自定义HTTP服务器
- **验证**: Zod
- **ORM**: Prisma (可选)

#### 桌面应用
- **框架**: Electron
- **构建工具**: Vite
- **打包工具**: electron-builder
- **UI框架**: React + Tailwind CSS

#### Monorepo
- **包管理器**: pnpm
- **构建工具**: Turborepo
- **代码共享**: TypeScript Project References

#### 数据库
- **主数据库**: PostgreSQL 或 MongoDB
- **缓存**: Redis (可选)

#### DevOps
- **容器化**: Docker + Docker Compose
- **进程管理**: PM2
- **反向代理**: Nginx

---

## 功能需求

### 1. Overlay页面模块

#### 1.1 比分板 (Scoreboard)
**路由**: `/overlay/scoreboard`

**功能需求**:
- 显示双方队伍名称和Logo
- 实时比分更新（局分）
- 当前地图名称
- 当前回合数
- BO3/BO5系列赛进度
- 队伍经济显示（可选）

**交互需求**:
- 比分更新时播放动画
- 支持显示/隐藏切换
- 入场/退场动画

**设计要求**:
- 透明背景
- 尺寸: 1920x1080 适配
- 刷新率: 60fps

#### 1.2 BP系统 (Ban/Pick)
**路由**: `/overlay/bp`

**功能需求**:
- 地图池显示（7张地图）
- Ban阶段可视化
- Pick阶段可视化
- 当前操作队伍高亮
- 倒计时显示
- Ban/Pick顺序指示

**流程支持**:
- BO1: Ban-Ban-Ban-Ban-Ban-Ban (剩余1图)
- BO3: Ban-Ban-Pick-Pick-Ban-Ban (剩余1图)
- BO5: Pick-Pick-Ban-Ban-Pick-Pick-Ban

**交互需求**:
- Ban/Pick操作实时显示
- 操作确认动画
- 支持撤销操作

#### 1.3 选手信息条 (Lower Third)
**路由**: `/overlay/lower-third`

**功能需求**:
- 选手游戏ID
- 真实姓名
- 国籍/头像
- 当前KDA
- 击杀数高亮

**交互需求**:
- 滑入/滑出动画
- 支持单人/五人模式
- 自动轮播（可选）

#### 1.4 顶部信息栏 (Top Bar)
**路由**: `/overlay/top-bar`

**功能需求**:
- 赛事名称
- 比赛阶段（小组赛/淘汰赛）
- 当前时间
- 赞助商Logo

#### 1.5 地图禁选 (Map Veto)
**路由**: `/overlay/map-veto`

**功能需求**:
- 完整veto流程展示
- 已ban/pick地图状态
- 最终地图池结果

#### 1.6 辅助Overlay
- **倒计时器** `/overlay/countdown` - 暂停倒计时
- **回放标识** `/overlay/replay` - REPLAY字样显示
- **中场休息** `/overlay/break` - 休息画面
- **赞助商** `/overlay/sponsor` - 赞助商轮播
- **选手摄像头边框** `/overlay/player-cam` - 摄像头装饰框

### 2. 控制面板模块

#### 2.1 主控制台 (Dashboard)
**路由**: `/admin/dashboard`

**功能需求**:
- 比赛总览
- 快速操作面板
- 当前overlay状态
- WebSocket连接状态
- 系统日志

#### 2.2 比赛控制 (Match Control)
**路由**: `/admin/match-control`

**功能需求**:
- 队伍信息编辑
  - 队名、Logo、简称
  - 选手名单
- 比分控制
  - +1/-1 按钮
  - 直接输入
  - 重置功能
- 地图选择
- 回合数控制
- 比赛阶段切换

**操作记录**:
- 所有操作记录日志
- 支持撤销/重做

#### 2.3 BP控制面板 (BP Control)
**路由**: `/admin/bp-control`

**功能需求**:
- 地图池管理
- Ban操作
- Pick操作
- 倒计时控制
- 当前队伍切换
- BP流程预设加载
- 重置BP流程

**预设方案**:
- BO1流程
- BO3流程
- BO5流程
- 自定义流程

#### 2.4 场景切换器 (Scene Switcher)
**路由**: `/admin/scenes`

**功能需求**:
- 预设场景管理
  - 开场场景
  - BP场景
  - 比赛中场景
  - 中场休息场景
  - 结束场景
- 一键切换overlay组合
- 场景编辑器

#### 2.5 Overlay开关控制
**路由**: `/admin/overlay-toggle`

**功能需求**:
- 所有overlay显示/隐藏开关
- 透明度控制
- 位置微调（可选）

### 3. 数据管理模块

#### 3.1 队伍管理
- CRUD操作
- Logo上传
- 历史数据

#### 3.2 选手管理
- 选手信息
- 统计数据
- 头像管理

#### 3.3 赛事管理
- 赛事创建
- 赛程安排
- 对阵配置

---

## 开发计划

### 阶段划分（8周计划）

#### Week 1: 基础搭建 (2025-02-03 ~ 02-09)

**Day 1-2: 项目初始化**
- [ ] 创建Git仓库
- [ ] 前端项目搭建 (Next.js)
- [ ] 后端项目搭建 (Express)
- [ ] Docker环境配置
- [ ] 数据库设计

**交付物**:
- 项目脚手架
- 开发环境文档
- 数据库Schema

**Day 3-4: WebSocket基础**
- [ ] 后端Socket.io服务
- [ ] 前端Socket连接
- [ ] 事件定义
- [ ] 心跳检测
- [ ] 断线重连机制

**交付物**:
- WebSocket通信Demo
- 事件文档

**Day 5-7: 数据结构设计**
- [ ] TypeScript类型定义
- [ ] 数据模型设计
- [ ] API接口定义
- [ ] 状态管理架构

**交付物**:
- 完整类型定义文件
- API文档v1.0

---

#### Week 2: 核心Overlay (2025-02-10 ~ 02-16)

**Day 8-10: 比分板开发**
- [ ] UI组件开发
- [ ] WebSocket集成
- [ ] 动画实现
- [ ] OBS测试

**交付物**:
- 可用的比分板Overlay
- OBS配置文档

**Day 11-14: BP系统开发**
- [ ] BP UI设计实现
- [ ] Ban/Pick逻辑
- [ ] 倒计时功能
- [ ] 流程状态机
- [ ] 动画效果

**交付物**:
- 完整BP系统
- BP流程测试报告

---

#### Week 3: 控制面板 (2025-02-17 ~ 02-23)

**Day 15-17: 主控制台**
- [ ] Dashboard布局
- [ ] 比分控制组件
- [ ] 队伍管理界面
- [ ] WebSocket发送

**Day 18-19: BP控制面板**
- [ ] BP操作界面
- [ ] 预设方案管理
- [ ] 撤销/重做功能

**Day 20-21: 场景切换**
- [ ] 场景管理器
- [ ] 预设场景配置
- [ ] 一键切换功能

**交付物**:
- 完整控制面板
- 操作手册v1.0

---

#### Week 3.5: GSI集成 (2025-02-24 ~ 02-27)

**Day 22-23: CS2 GSI服务器开发**
- [ ] 理解CS2 GSI (Game State Integration)
- [ ] 配置CS2游戏GSI
- [ ] 后端GSI HTTP服务器
- [ ] GSI数据解析
- [ ] 实时比分自动同步

**GSI功能清单**:
- 实时回合数据
- 队伍比分自动更新
- 选手KDA实时统计
- 经济数据追踪
- 炸弹状态监控
- MVP识别

**Day 24-25: Monorepo架构重构**
- [ ] 项目重构为Monorepo
- [ ] 使用pnpm workspace/Turborepo
- [ ] 抽取共享代码到shared包
- [ ] 配置统一的TypeScript
- [ ] 统一ESLint/Prettier

**Monorepo结构**:
```
cs2-overlay-system/
├── packages/
│   ├── web/              # Next.js Overlays
│   ├── desktop/          # Electron控制面板
│   ├── server/           # 后端 + GSI
│   └── shared/           # 共享类型和工具
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

**Day 26-27: Electron桌面应用开发**
- [ ] Electron项目初始化
- [ ] 集成控制面板到Electron
- [ ] 窗口管理和托盘图标
- [ ] 自动启动功能
- [ ] 系统通知

**交付物**:
- GSI集成完成
- Monorepo架构
- Electron Alpha版本

---

#### Week 4: 扩展功能 + Electron完善 (2025-02-28 ~ 03-06)

#### Week 4: 扩展功能 + Electron完善 (2025-02-28 ~ 03-06)

**Day 28-29: 选手信息条**
- [ ] Lower Third组件
- [ ] GSI数据绑定
- [ ] 动画效果

**Day 30-31: 地图Veto**
- [ ] Map Veto UI
- [ ] 流程控制
- [ ] 结果展示

**Day 32-33: Electron功能完善**
- [ ] 自动更新功能
- [ ] 配置持久化
- [ ] 快捷键支持
- [ ] 打包优化

**Day 34: 辅助Overlay**
- [ ] 倒计时器
- [ ] 回放标识
- [ ] 中场休息画面
- [ ] 赞助商展示

**Day 35: 集成测试**
- [ ] 所有overlay联动测试
- [ ] GSI实时数据测试
- [ ] Electron打包测试
- [ ] 性能测试
- [ ] 兼容性测试

**交付物**:
- 所有Overlay页面
- Electron Beta版本
- GSI完整集成
- 测试报告

---

#### Week 5: 视觉优化 (2025-03-07 ~ 03-13)

**Day 29-31: UI/UX打磨**
- [ ] 视觉效果优化
- [ ] 动画流畅度调整
- [ ] 字体和排版

**Day 32-33: 主题系统**
- [ ] CSS变量系统
- [ ] 主题切换功能
- [ ] 预设主题（3-5套）

**Day 34-35: 性能优化**
- [ ] 组件懒加载
- [ ] 图片优化
- [ ] WebSocket节流
- [ ] 内存泄漏检查

**交付物**:
- 优化后的系统
- 性能测试报告

---

#### Week 6: 稳定性 (2025-03-14 ~ 03-20)

**Day 36-38: 错误处理**
- [ ] 异常捕获机制
- [ ] 降级方案
- [ ] 错误日志系统
- [ ] 数据备份恢复

**Day 39-40: 部署准备**
- [ ] 生产环境配置
- [ ] Docker镜像构建
- [ ] CI/CD流程
- [ ] 监控告警

**Day 41-42: 文档编写**
- [ ] 用户使用手册
- [ ] 部署运维文档
- [ ] API文档完善
- [ ] 故障排查手册

**交付物**:
- 生产就绪版本
- 完整文档集

---

#### Week 7-8: 高级功能 (2025-03-21 ~ 04-03)

**可选功能开发**:
- [ ] 数据统计面板
- [ ] 历史数据查询
- [ ] 自动化集成
- [ ] 多语言支持
- [ ] 音效系统
- [ ] 移动端控制（PWA）

**交付物**:
- 功能完整的系统
- v1.0正式版本

---

### 里程碑检查点

#### Milestone 1: MVP完成 (Week 2结束)
**验收标准**:
- ✅ 比分板可在OBS中正常显示
- ✅ 控制面板可更新比分
- ✅ WebSocket实时同步正常
- ✅ 基础BP系统可用

**演示要求**:
- 模拟一场BO3比赛完整流程

#### Milestone 2: 功能完整 (Week 4结束)
**验收标准**:
- ✅ 所有主要Overlay完成
- ✅ 控制面板功能完整
- ✅ 可进行完整赛事演练
- ✅ 动画效果流畅

**演示要求**:
- 模拟真实赛事2小时直播

#### Milestone 3: 生产就绪 (Week 6结束)
**验收标准**:
- ✅ 系统稳定运行3小时+
- ✅ 性能达标（60fps）
- ✅ 文档齐全
- ✅ 部署方案完整

**交付要求**:
- 可独立部署使用
- 提供培训材料

---

## 技术选型

### 前端技术栈详解

#### 为什么选择 Next.js?
1. **SSR支持** - 首屏加载优化
2. **文件路由** - 天然支持多页面
3. **API Routes** - 可内置简单后端
4. **优秀生态** - 丰富的插件
5. **开发体验** - 热重载、TypeScript支持

#### 为什么选择 Framer Motion?
1. **声明式API** - 代码简洁
2. **性能优秀** - GPU加速
3. **手势支持** - 拖拽等交互
4. **Spring动画** - 自然的物理动画
5. **React集成** - 无缝使用

#### 为什么选择 Zustand?
1. **轻量级** - 仅1kb
2. **简单易用** - 无需Provider
3. **TypeScript友好** - 完美类型推导
4. **DevTools** - 调试方便
5. **性能好** - 细粒度更新

### 后端技术栈详解

#### 为什么选择 Express?
1. **成熟稳定** - 久经考验
2. **中间件丰富** - 生态完善
3. **灵活** - 高度可定制
4. **文档齐全** - 易学习
5. **社区活跃** - 问题解决快

#### 为什么选择 Socket.io?
1. **自动降级** - 兼容性好
2. **房间机制** - 易实现分组
3. **重连机制** - 稳定性高
4. **二进制支持** - 传输效率
5. **双向通信** - 实时性强

### 数据库选择建议

#### PostgreSQL (推荐)
**适用场景**:
- 需要复杂查询
- 数据关系复杂
- ACID要求高

**优势**:
- 功能强大
- 扩展性好
- 开源免费

#### MongoDB
**适用场景**:
- 数据结构灵活
- 快速迭代
- 横向扩展需求

**优势**:
- Schema灵活
- 查询简单
- 易于上手

---

## 系统设计

### 数据模型设计

#### 核心实体

```typescript
// Match - 比赛
interface Match {
  id: string;
  eventId: string;           // 关联赛事
  teamA: Team;
  teamB: Team;
  format: 'BO1' | 'BO3' | 'BO5';
  currentMap: number;        // 当前第几张图
  maps: Map[];
  status: 'upcoming' | 'live' | 'finished';
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Team - 队伍
interface Team {
  id: string;
  name: string;
  shortName: string;         // 缩写（3-4字符）
  logo: string;              // Logo URL
  country: string;
  players: Player[];
  score: number;             // 当前比分
  economy?: number;          // 经济
  createdAt: Date;
  updatedAt: Date;
}

// Player - 选手
interface Player {
  id: string;
  gameId: string;            // 游戏ID
  realName: string;
  country: string;
  avatar?: string;
  teamId: string;
  stats?: PlayerStats;
  createdAt: Date;
  updatedAt: Date;
}

// PlayerStats - 选手统计
interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  adr: number;              // 平均伤害
  rating: number;           // Rating 2.0
}

// Map - 地图
interface Map {
  id: string;
  matchId: string;
  name: string;
  order: number;            // 第几张图
  scoreA: number;
  scoreB: number;
  status: 'upcoming' | 'live' | 'finished';
  rounds: Round[];
  winner?: 'A' | 'B';
  createdAt: Date;
  updatedAt: Date;
}

// Round - 回合
interface Round {
  id: string;
  mapId: string;
  roundNumber: number;
  winner: 'A' | 'B';
  reason: 'elimination' | 'bomb' | 'time' | 'defuse';
  mvp?: string;             // 玩家ID
  createdAt: Date;
}

// BPSession - BP会话
interface BPSession {
  id: string;
  matchId: string;
  mapPool: string[];        // 地图池
  actions: BPAction[];
  currentPhase: 'ban' | 'pick';
  activeTeam: 'A' | 'B';
  countdown: number;
  status: 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// BPAction - BP操作
interface BPAction {
  id: string;
  sessionId: string;
  type: 'ban' | 'pick';
  team: 'A' | 'B';
  map: string;
  order: number;
  timestamp: Date;
}

// OverlayState - Overlay状态
interface OverlayState {
  scoreboard: {
    visible: boolean;
    opacity: number;
  };
  bp: {
    visible: boolean;
    opacity: number;
  };
  lowerThird: {
    visible: boolean;
    player?: Player;
  };
  // ... 其他overlay
}

// Event - 赛事
interface Event {
  id: string;
  name: string;
  logo: string;
  startDate: Date;
  endDate: Date;
  format: string;
  sponsors: Sponsor[];
  createdAt: Date;
  updatedAt: Date;
}

// Sponsor - 赞助商
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'title' | 'main' | 'partner';
  displayDuration: number;  // 展示时长（秒）
}
```

### WebSocket事件定义

#### 客户端 → 服务端

```typescript
// 连接事件
'client:connect' - 客户端连接
'client:disconnect' - 客户端断开

// 比赛控制
'match:scoreUpdate' - 更新比分
  payload: { team: 'A' | 'B', delta: number }

'match:roundUpdate' - 更新回合
  payload: { mapId: string, winner: 'A' | 'B' }

'match:statusChange' - 比赛状态变更
  payload: { status: MatchStatus }

// BP控制
'bp:ban' - Ban地图
  payload: { team: 'A' | 'B', map: string }

'bp:pick' - Pick地图
  payload: { team: 'A' | 'B', map: string }

'bp:undo' - 撤销操作
  payload: { actionId: string }

'bp:reset' - 重置BP
  payload: { sessionId: string }

// Overlay控制
'overlay:toggle' - 切换显示
  payload: { name: string, visible: boolean }

'overlay:scene' - 切换场景
  payload: { sceneId: string }
```

#### 服务端 → 客户端

```typescript
// 数据推送
'match:update' - 比赛数据更新
  payload: Match

'bp:update' - BP状态更新
  payload: BPSession

'overlay:update' - Overlay状态更新
  payload: OverlayState

'player:statsUpdate' - 选手数据更新
  payload: PlayerStats[]

// 系统消息
'system:error' - 错误消息
  payload: { code: string, message: string }

'system:notification' - 通知消息
  payload: { type: 'info' | 'warning' | 'success', message: string }
```

### API接口设计

#### RESTful API

```typescript
// 比赛相关
GET    /api/matches              // 获取比赛列表
GET    /api/matches/:id          // 获取比赛详情
POST   /api/matches              // 创建比赛
PUT    /api/matches/:id          // 更新比赛
DELETE /api/matches/:id          // 删除比赛

// 队伍相关
GET    /api/teams                // 获取队伍列表
GET    /api/teams/:id            // 获取队伍详情
POST   /api/teams                // 创建队伍
PUT    /api/teams/:id            // 更新队伍
DELETE /api/teams/:id            // 删除队伍

// 选手相关
GET    /api/players              // 获取选手列表
GET    /api/players/:id          // 获取选手详情
POST   /api/players              // 创建选手
PUT    /api/players/:id          // 更新选手
DELETE /api/players/:id          // 删除选手

// BP相关
GET    /api/bp/sessions/:matchId // 获取BP会话
POST   /api/bp/sessions          // 创建BP会话
PUT    /api/bp/sessions/:id      // 更新BP会话

// Overlay相关
GET    /api/overlay/state        // 获取当前状态
PUT    /api/overlay/state        // 更新状态

// 上传
POST   /api/upload/logo          // 上传Logo
POST   /api/upload/avatar        // 上传头像
```

### 状态管理架构

#### Zustand Store结构

```typescript
// stores/matchStore.ts
interface MatchStore {
  // 状态
  currentMatch: Match | null;
  matches: Match[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentMatch: (match: Match) => void;
  updateScore: (team: 'A' | 'B', delta: number) => void;
  fetchMatches: () => Promise<void>;
  createMatch: (data: CreateMatchDTO) => Promise<void>;
}

// stores/bpStore.ts
interface BPStore {
  session: BPSession | null;
  history: BPAction[];
  
  ban: (team: 'A' | 'B', map: string) => void;
  pick: (team: 'A' | 'B', map: string) => void;
  undo: () => void;
  reset: () => void;
}

// stores/overlayStore.ts
interface OverlayStore {
  states: OverlayState;
  
  toggle: (name: string, visible: boolean) => void;
  setOpacity: (name: string, opacity: number) => void;
  switchScene: (sceneId: string) => void;
}

// stores/socketStore.ts
interface SocketStore {
  connected: boolean;
  socket: Socket | null;
  
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: Function) => void;
}
```

---

## GSI集成详解

### CS2 Game State Integration简介

**GSI (Game State Integration)** 是CS2提供的官方API，允许外部应用实时获取游戏状态数据。这对于直播导播系统至关重要，因为它可以：

- ✅ **自动化数据采集** - 无需手动输入比分
- ✅ **实时性** - 毫秒级延迟
- ✅ **准确性** - 直接来自游戏引擎
- ✅ **丰富数据** - 选手KDA、经济、炸弹状态等

### GSI工作原理

```
┌─────────────┐       HTTP POST        ┌──────────────┐
│   CS2 Game  │ ──────────────────────> │  GSI Server  │
│             │   JSON Payload (1s)     │  (Node.js)   │
└─────────────┘                         └──────┬───────┘
                                               │
                                               │ Parse & Emit
                                               ▼
                                        ┌──────────────┐
                                        │  WebSocket   │
                                        │   Clients    │
                                        └──────────────┘
```

### GSI配置步骤

#### 1. 创建GSI配置文件

在CS2游戏目录创建配置文件：

**路径**: `steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/gamestate_integration_overlay.cfg`

```cfg
"CS2 Overlay Integration"
{
    "uri"               "http://localhost:3001/gsi"
    "timeout"           "5.0"
    "buffer"            "0.1"
    "throttle"          "0.5"
    "heartbeat"         "30.0"
    "auth"
    {
        "token"         "YOUR_SECRET_TOKEN_HERE"
    }
    "data"
    {
        "provider"            "1"
        "map"                 "1"
        "round"               "1"
        "player_id"           "1"
        "player_state"        "1"
        "player_weapons"      "1"
        "player_match_stats"  "1"
        "allplayers"          "1"
        "bomb"                "1"
        "phase_countdowns"    "1"
    }
}
```

#### 2. 后端GSI服务器实现

```typescript
// server/gsi/gsiServer.ts
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';

interface GSIPayload {
  provider: {
    name: string;
    appid: number;
    version: number;
    steamid: string;
    timestamp: number;
  };
  map: {
    name: string;
    phase: 'warmup' | 'live' | 'intermission' | 'gameover';
    round: number;
    team_ct: {
      score: number;
      consecutive_round_losses: number;
    };
    team_t: {
      score: number;
      consecutive_round_losses: number;
    };
  };
  round: {
    phase: 'freezetime' | 'live' | 'over';
    bomb?: 'planted' | 'defused' | 'exploded';
    win_team?: 'CT' | 'T';
  };
  allplayers: {
    [steamid: string]: {
      name: string;
      observer_slot: number;
      team: 'T' | 'CT';
      match_stats: {
        kills: number;
        assists: number;
        deaths: number;
        mvps: number;
        score: number;
      };
      state: {
        health: number;
        armor: number;
        helmet: boolean;
        money: number;
        round_kills: number;
        round_killhs: number;
      };
    };
  };
  bomb?: {
    state: 'carried' | 'planted' | 'dropped' | 'defused' | 'exploded';
    position: string;
    countdown?: string;
  };
}

export class GSIServer {
  private app: express.Application;
  private io: SocketIOServer;
  private authToken: string;
  private currentState: GSIPayload | null = null;

  constructor(io: SocketIOServer, authToken: string) {
    this.app = express();
    this.io = io;
    this.authToken = authToken;
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use(express.json());
    
    this.app.post('/gsi', (req, res) => {
      // 验证token
      if (req.body.auth?.token !== this.authToken) {
        return res.status(401).send('Unauthorized');
      }

      const payload: GSIPayload = req.body;
      this.handleGSIUpdate(payload);
      
      res.status(200).send('OK');
    });
  }

  private handleGSIUpdate(payload: GSIPayload) {
    this.currentState = payload;

    // 提取关键数据
    const matchData = this.extractMatchData(payload);
    const playerStats = this.extractPlayerStats(payload);
    const roundInfo = this.extractRoundInfo(payload);

    // 通过WebSocket广播到所有客户端
    this.io.to('overlay').emit('gsi:matchUpdate', matchData);
    this.io.to('overlay').emit('gsi:playerStats', playerStats);
    this.io.to('overlay').emit('gsi:roundUpdate', roundInfo);

    // 自动更新数据库
    this.updateDatabase(matchData, playerStats);
  }

  private extractMatchData(payload: GSIPayload) {
    if (!payload.map) return null;

    return {
      mapName: payload.map.name,
      phase: payload.map.phase,
      round: payload.map.round,
      teamCT: {
        score: payload.map.team_ct.score,
        consecutiveLosses: payload.map.team_ct.consecutive_round_losses
      },
      teamT: {
        score: payload.map.team_t.score,
        consecutiveLosses: payload.map.team_t.consecutive_round_losses
      }
    };
  }

  private extractPlayerStats(payload: GSIPayload) {
    if (!payload.allplayers) return [];

    return Object.entries(payload.allplayers).map(([steamid, player]) => ({
      steamid,
      name: player.name,
      team: player.team,
      kills: player.match_stats.kills,
      assists: player.match_stats.assists,
      deaths: player.match_stats.deaths,
      mvps: player.match_stats.mvps,
      score: player.match_stats.score,
      health: player.state.health,
      armor: player.state.armor,
      money: player.state.money,
      roundKills: player.state.round_kills
    }));
  }

  private extractRoundInfo(payload: GSIPayload) {
    if (!payload.round) return null;

    return {
      phase: payload.round.phase,
      bombState: payload.bomb?.state,
      bombCountdown: payload.bomb?.countdown,
      winTeam: payload.round.win_team
    };
  }

  private async updateDatabase(matchData: any, playerStats: any[]) {
    // 自动更新比分到数据库
    if (matchData) {
      await prisma.match.update({
        where: { id: currentMatchId },
        data: {
          // 根据队伍名称匹配
          teamA: { score: matchData.teamCT.score },
          teamB: { score: matchData.teamT.score }
        }
      });
    }

    // 更新选手统计
    for (const player of playerStats) {
      await prisma.playerStats.upsert({
        where: { steamid_matchId: { steamid: player.steamid, matchId: currentMatchId } },
        update: {
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists
        },
        create: {
          steamid: player.steamid,
          matchId: currentMatchId,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists
        }
      });
    }
  }

  listen(port: number) {
    this.app.listen(port, () => {
      console.log(`GSI Server listening on port ${port}`);
    });
  }
}
```

#### 3. 前端GSI数据集成

```typescript
// components/overlays/LiveScoreboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { socketService } from '@/lib/socket';

export default function LiveScoreboard() {
  const [matchData, setMatchData] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // 监听GSI实时数据
    socketService.on('gsi:matchUpdate', (data) => {
      setMatchData(data);
      setIsLive(true);
    });

    // 5秒无数据则认为断开
    const timeout = setTimeout(() => {
      setIsLive(false);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      socketService.off('gsi:matchUpdate');
    };
  }, [matchData]);

  return (
    <div className="relative">
      {/* GSI连接状态指示器 */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
        isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} />
      
      {/* 比分显示 */}
      {matchData && (
        <motion.div
          key={matchData.teamCT.score + matchData.teamT.score}
          animate={{ scale: [1, 1.05, 1] }}
        >
          <div>CT: {matchData.teamCT.score}</div>
          <div>T: {matchData.teamT.score}</div>
        </motion.div>
      )}
    </div>
  );
}
```

### GSI数据应用场景

#### 1. 自动比分更新
```typescript
// 比分自动同步到Overlay
socketService.on('gsi:matchUpdate', (data) => {
  updateScoreboard(data.teamCT.score, data.teamT.score);
});
```

#### 2. 实时选手统计
```typescript
// 显示选手KDA
socketService.on('gsi:playerStats', (players) => {
  const topFragger = players.sort((a, b) => b.kills - a.kills)[0];
  showPlayerHighlight(topFragger);
});
```

#### 3. 炸弹状态提示
```typescript
// C4已安装提示
socketService.on('gsi:roundUpdate', (data) => {
  if (data.bombState === 'planted') {
    showBombPlantedOverlay(data.bombCountdown);
  }
});
```

#### 4. MVP自动识别
```typescript
// 回合结束显示MVP
socketService.on('gsi:roundUpdate', (data) => {
  if (data.phase === 'over' && data.mvp) {
    showMVPAnimation(data.mvp);
  }
});
```

---

## Electron桌面应用开发

### 为什么使用Electron？

对于导播控制面板，Electron提供了以下优势：

1. **独立运行** - 不依赖浏览器，更专业
2. **系统集成** - 托盘图标、快捷键、自动启动
3. **性能优化** - 独立进程，不受浏览器限制
4. **分发便捷** - 打包成exe/dmg/AppImage
5. **离线可用** - 无需网络即可使用

### Monorepo项目结构

```
cs2-overlay-system/
├── packages/
│   ├── web/                    # Next.js Overlay页面
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   │
│   ├── desktop/                # Electron控制面板
│   │   ├── src/
│   │   │   ├── main/          # Electron主进程
│   │   │   ├── renderer/      # React渲染进程
│   │   │   └── preload/       # 预加载脚本
│   │   ├── electron-builder.yml
│   │   └── package.json
│   │
│   ├── server/                 # 后端服务
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── socket/
│   │   │   ├── gsi/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── shared/                 # 共享代码
│       ├── types/             # TypeScript类型
│       ├── utils/             # 工具函数
│       ├── constants/         # 常量定义
│       └── package.json
│
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── package.json
```

### Monorepo配置

#### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

#### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "out/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

#### 根package.json
```json
{
  "name": "cs2-overlay-system",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "dev:web": "pnpm --filter web dev",
    "dev:desktop": "pnpm --filter desktop dev",
    "dev:server": "pnpm --filter server dev",
    "build:desktop": "pnpm --filter desktop build"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.2.0"
  }
}
```

### Electron主进程实现

```typescript
// packages/desktop/src/main/index.ts
import { app, BrowserWindow, Tray, Menu, globalShortcut } from 'electron';
import path from 'path';

class DesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    await app.whenReady();
    this.createWindow();
    this.createTray();
    this.registerShortcuts();
    this.setupAutoLaunch();
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      title: 'CS2 Overlay Control Panel',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      },
      // 自定义标题栏
      frame: false,
      titleBarStyle: 'hidden'
    });

    // 开发环境
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      // 生产环境
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 窗口事件
    this.mainWindow.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        this.mainWindow?.hide();
      }
    });
  }

  private createTray() {
    this.tray = new Tray(path.join(__dirname, '../assets/icon.png'));
    
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show Control Panel', 
        click: () => this.mainWindow?.show() 
      },
      { 
        label: 'Open Overlay (Browser)', 
        click: () => {
          require('electron').shell.openExternal('http://localhost:3000/overlay/scoreboard');
        }
      },
      { type: 'separator' },
      { 
        label: 'Start Server', 
        click: () => this.startBackendServer() 
      },
      { 
        label: 'Stop Server', 
        click: () => this.stopBackendServer() 
      },
      { type: 'separator' },
      { 
        label: 'Quit', 
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('CS2 Overlay System');
    
    this.tray.on('double-click', () => {
      this.mainWindow?.show();
    });
  }

  private registerShortcuts() {
    // 全局快捷键
    globalShortcut.register('CommandOrControl+Shift+O', () => {
      this.mainWindow?.show();
    });

    // 场景切换快捷键
    globalShortcut.register('F1', () => {
      this.toggleOverlay('scoreboard');
    });

    globalShortcut.register('F2', () => {
      this.toggleOverlay('bp');
    });
  }

  private toggleOverlay(name: string) {
    // 通过IPC通知渲染进程
    this.mainWindow?.webContents.send('overlay:toggle', { name });
  }

  private setupAutoLaunch() {
    if (process.platform === 'win32') {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath
      });
    }
  }

  private startBackendServer() {
    // 启动内置的后端服务器
    const { fork } = require('child_process');
    const serverPath = path.join(__dirname, '../../server/dist/index.js');
    fork(serverPath);
  }

  private stopBackendServer() {
    // 停止后端服务器
  }
}

new DesktopApp();
```

### Electron渲染进程（React）

```typescript
// packages/desktop/src/renderer/App.tsx
import { useState, useEffect } from 'react';
import { MatchControl } from './components/MatchControl';
import { BPControl } from './components/BPControl';
import { GSIMonitor } from './components/GSIMonitor';

export default function App() {
  const [activeTab, setActiveTab] = useState('match');
  const [gsiConnected, setGsiConnected] = useState(false);

  useEffect(() => {
    // 监听GSI连接状态
    window.electron.on('gsi:status', (status) => {
      setGsiConnected(status.connected);
    });

    return () => {
      window.electron.removeAllListeners('gsi:status');
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* 自定义标题栏 */}
      <div className="h-8 bg-gray-800 drag flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            gsiConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm">CS2 Overlay Control Panel</span>
        </div>
        <div className="no-drag flex gap-2">
          <button onClick={() => window.electron.minimize()}>−</button>
          <button onClick={() => window.electron.maximize()}>□</button>
          <button onClick={() => window.electron.close()}>×</button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-gray-800 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('match')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'match' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Match Control
            </button>
            <button
              onClick={() => setActiveTab('bp')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'bp' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              BP Control
            </button>
            <button
              onClick={() => setActiveTab('gsi')}
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'gsi' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              GSI Monitor
            </button>
          </nav>
        </aside>

        {/* 内容区 */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'match' && <MatchControl />}
          {activeTab === 'bp' && <BPControl />}
          {activeTab === 'gsi' && <GSIMonitor />}
        </main>
      </div>

      {/* 状态栏 */}
      <footer className="h-8 bg-gray-800 px-4 flex items-center justify-between text-xs">
        <div>Server: Running on :3001</div>
        <div>Overlays: 3 connected</div>
      </footer>
    </div>
  );
}
```

### Electron Preload脚本

```typescript
// packages/desktop/src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 窗口控制
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),

  // 事件监听
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Overlay控制
  toggleOverlay: (name: string, visible: boolean) => {
    ipcRenderer.send('overlay:toggle', { name, visible });
  },

  // 服务器控制
  startServer: () => ipcRenderer.send('server:start'),
  stopServer: () => ipcRenderer.send('server:stop')
});
```

### Electron打包配置

```yaml
# packages/desktop/electron-builder.yml
appId: com.cs2overlay.desktop
productName: CS2 Overlay System
directories:
  output: dist-electron
  buildResources: build

files:
  - dist/**/*
  - node_modules/**/*
  - package.json

mac:
  category: public.app-category.utilities
  target:
    - dmg
    - zip
  icon: build/icon.icns

win:
  target:
    - nsis
    - portable
  icon: build/icon.ico

linux:
  target:
    - AppImage
    - deb
  icon: build/icon.png
  category: Utility

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
```

### 打包命令

```json
// packages/desktop/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "build:win": "npm run build -- --win",
    "build:mac": "npm run build -- --mac",
    "build:linux": "npm run build -- --linux"
  }
}
```

---

## 实现细节

### 1. WebSocket实时通信

#### 服务端实现

```typescript
// server/socket.ts
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // 连接处理
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // 加入房间
    socket.join('overlay');
    socket.join('admin');
    
    // 比赛控制
    socket.on('match:scoreUpdate', async (data) => {
      try {
        const match = await updateMatchScore(data);
        io.to('overlay').emit('match:update', match);
      } catch (error) {
        socket.emit('system:error', { 
          message: 'Failed to update score' 
        });
      }
    });
    
    // BP控制
    socket.on('bp:ban', async (data) => {
      try {
        const session = await processBan(data);
        io.to('overlay').emit('bp:update', session);
      } catch (error) {
        socket.emit('system:error', { 
          message: 'Failed to ban map' 
        });
      }
    });
    
    // Overlay控制
    socket.on('overlay:toggle', (data) => {
      io.to('overlay').emit('overlay:update', data);
    });
    
    // 断开处理
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
```

#### 客户端实现

```typescript
// lib/socket.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string) {
    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('Connection error:', error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        // 触发降级方案
        this.handleConnectionFailure();
      }
    });
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, handler: Function) {
    this.socket?.on(event, handler as any);
  }

  off(event: string, handler?: Function) {
    this.socket?.off(event, handler as any);
  }

  disconnect() {
    this.socket?.disconnect();
  }

  private handleConnectionFailure() {
    // 启用本地缓存
    // 显示离线提示
    // 尝试使用备用服务器
  }
}

export const socketService = new SocketService();
```

### 2. Overlay组件实现

#### 比分板组件

```typescript
// components/overlays/Scoreboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socketService } from '@/lib/socket';
import { Match } from '@/types';

export default function Scoreboard() {
  const [match, setMatch] = useState<Match | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 连接Socket
    socketService.connect(process.env.NEXT_PUBLIC_SOCKET_URL!);

    // 监听比赛更新
    socketService.on('match:update', (data: Match) => {
      setMatch(data);
    });

    // 监听显示控制
    socketService.on('overlay:update', (data: any) => {
      if (data.name === 'scoreboard') {
        setVisible(data.visible);
      }
    });

    return () => {
      socketService.off('match:update');
      socketService.off('overlay:update');
    };
  }, []);

  if (!match) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-1/2 -translate-x-1/2 mt-8"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-lg px-8 py-4 shadow-2xl border border-gray-700/50">
            <div className="flex items-center gap-8">
              {/* 队伍A */}
              <TeamSection 
                team={match.teamA} 
                score={match.teamA.score}
                side="left"
              />
              
              {/* 中间信息 */}
              <div className="text-center min-w-[120px]">
                <div className="text-sm text-gray-400 mb-1">
                  {match.currentMap}/{match.format.replace('BO', '')}
                </div>
                <div className="text-2xl font-bold text-white">
                  {match.maps[match.currentMap - 1]?.name || 'TBD'}
                </div>
              </div>
              
              {/* 队伍B */}
              <TeamSection 
                team={match.teamB} 
                score={match.teamB.score}
                side="right"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TeamSection({ team, score, side }: any) {
  return (
    <motion.div 
      className={`flex items-center gap-4 ${side === 'right' ? 'flex-row-reverse' : ''}`}
      key={score} // Key变化触发动画
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
    >
      <img 
        src={team.logo} 
        alt={team.name}
        className="w-12 h-12 object-contain"
      />
      <div className={side === 'right' ? 'text-right' : ''}>
        <div className="text-xl font-bold text-white">
          {team.shortName}
        </div>
        <div className="text-sm text-gray-400">
          {team.name}
        </div>
      </div>
      <div className="text-4xl font-bold text-white min-w-[60px] text-center">
        {score}
      </div>
    </motion.div>
  );
}
```

#### BP系统组件

```typescript
// components/overlays/BP.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socketService } from '@/lib/socket';
import { BPSession, BPAction } from '@/types';

const MAP_POOL = [
  { name: 'Dust2', image: '/maps/dust2.jpg' },
  { name: 'Mirage', image: '/maps/mirage.jpg' },
  { name: 'Inferno', image: '/maps/inferno.jpg' },
  { name: 'Nuke', image: '/maps/nuke.jpg' },
  { name: 'Overpass', image: '/maps/overpass.jpg' },
  { name: 'Vertigo', image: '/maps/vertigo.jpg' },
  { name: 'Ancient', image: '/maps/ancient.jpg' },
];

export default function BP() {
  const [session, setSession] = useState<BPSession | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    socketService.on('bp:update', (data: BPSession) => {
      setSession(data);
    });

    socketService.on('overlay:update', (data: any) => {
      if (data.name === 'bp') {
        setVisible(data.visible);
      }
    });

    return () => {
      socketService.off('bp:update');
      socketService.off('overlay:update');
    };
  }, []);

  if (!visible || !session) return null;

  const getMapStatus = (mapName: string) => {
    const action = session.actions.find(a => a.map === mapName);
    return action || null;
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Map Veto
        </h2>
        
        <div className="grid grid-cols-4 gap-6">
          {MAP_POOL.map((map, index) => {
            const status = getMapStatus(map.name);
            return (
              <MapCard 
                key={map.name}
                map={map}
                status={status}
                index={index}
              />
            );
          })}
        </div>

        {/* 当前操作提示 */}
        <motion.div 
          className="mt-8 text-center"
          key={session.activeTeam + session.currentPhase}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-2xl text-white">
            Team {session.activeTeam} - {session.currentPhase.toUpperCase()}
          </div>
          {session.countdown > 0 && (
            <div className="text-5xl font-bold text-orange-500 mt-2">
              {session.countdown}s
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function MapCard({ map, status, index }: any) {
  const isBanned = status?.type === 'ban';
  const isPicked = status?.type === 'pick';

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg aspect-video"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <img 
        src={map.image} 
        alt={map.name}
        className={`w-full h-full object-cover transition-all ${
          isBanned ? 'grayscale brightness-50' : ''
        }`}
      />
      
      {/* 地图名称 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <div className="text-xl font-bold text-white">
          {map.name}
        </div>
      </div>

      {/* Ban/Pick标记 */}
      <AnimatePresence>
        {status && (
          <motion.div
            className={`absolute inset-0 flex items-center justify-center ${
              isBanned ? 'bg-red-500/80' : 'bg-green-500/80'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="text-6xl font-bold text-white">
              {isBanned ? 'BANNED' : 'PICKED'}
            </div>
            <div className="absolute bottom-4 text-2xl text-white">
              Team {status.team}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### 3. 控制面板实现

#### 比赛控制组件

```typescript
// app/admin/match-control/page.tsx
'use client';

import { useState } from 'react';
import { socketService } from '@/lib/socket';
import { Match } from '@/types';

export default function MatchControl() {
  const [match, setMatch] = useState<Match | null>(null);

  const updateScore = (team: 'A' | 'B', delta: number) => {
    socketService.emit('match:scoreUpdate', { team, delta });
  };

  const resetMatch = () => {
    if (confirm('确定要重置比赛吗？')) {
      socketService.emit('match:reset', { matchId: match?.id });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">比赛控制</h1>
      
      {/* 比分控制 */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <ScoreControl 
          team={match?.teamA}
          side="A"
          onUpdate={updateScore}
        />
        <ScoreControl 
          team={match?.teamB}
          side="B"
          onUpdate={updateScore}
        />
      </div>

      {/* 地图控制 */}
      <div className="bg-white rounded-lg p-6 shadow mb-8">
        <h2 className="text-xl font-bold mb-4">地图控制</h2>
        <div className="grid grid-cols-7 gap-4">
          {MAP_POOL.map(map => (
            <button
              key={map.name}
              onClick={() => selectMap(map.name)}
              className="p-4 border rounded hover:bg-gray-50"
            >
              <img src={map.image} className="w-full mb-2" />
              <div className="text-sm">{map.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="flex gap-4">
        <button
          onClick={resetMatch}
          className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
        >
          重置比赛
        </button>
        <button
          onClick={() => socketService.emit('match:pause')}
          className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          暂停
        </button>
      </div>
    </div>
  );
}

function ScoreControl({ team, side, onUpdate }: any) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center gap-4 mb-4">
        <img src={team?.logo} className="w-16 h-16" />
        <div>
          <div className="text-2xl font-bold">{team?.name}</div>
          <div className="text-gray-500">{team?.shortName}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => onUpdate(side, -1)}
          className="px-6 py-3 bg-red-500 text-white rounded text-2xl font-bold hover:bg-red-600"
        >
          -1
        </button>
        
        <div className="text-6xl font-bold flex-1 text-center">
          {team?.score || 0}
        </div>
        
        <button
          onClick={() => onUpdate(side, 1)}
          className="px-6 py-3 bg-green-500 text-white rounded text-2xl font-bold hover:bg-green-600"
        >
          +1
        </button>
      </div>
    </div>
  );
}
```

### 4. 数据持久化

#### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Event {
  id        String   @id @default(cuid())
  name      String
  logo      String?
  startDate DateTime
  endDate   DateTime
  format    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  matches   Match[]
  sponsors  Sponsor[]
}

model Team {
  id         String   @id @default(cuid())
  name       String
  shortName  String
  logo       String?
  country    String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  players    Player[]
  matchesA   Match[]  @relation("TeamA")
  matchesB   Match[]  @relation("TeamB")
}

model Player {
  id        String   @id @default(cuid())
  gameId    String   @unique
  realName  String
  country   String
  avatar    String?
  teamId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  team      Team     @relation(fields: [teamId], references: [id])
}

model Match {
  id          String      @id @default(cuid())
  eventId     String
  teamAId     String
  teamBId     String
  format      String
  currentMap  Int         @default(1)
  status      String      @default("upcoming")
  startTime   DateTime
  endTime     DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  event       Event       @relation(fields: [eventId], references: [id])
  teamA       Team        @relation("TeamA", fields: [teamAId], references: [id])
  teamB       Team        @relation("TeamB", fields: [teamBId], references: [id])
  maps        Map[]
  bpSessions  BPSession[]
}

model Map {
  id        String   @id @default(cuid())
  matchId   String
  name      String
  order     Int
  scoreA    Int      @default(0)
  scoreB    Int      @default(0)
  status    String   @default("upcoming")
  winner    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  match     Match    @relation(fields: [matchId], references: [id])
  rounds    Round[]
}

model Round {
  id          String   @id @default(cuid())
  mapId       String
  roundNumber Int
  winner      String
  reason      String
  mvp         String?
  createdAt   DateTime @default(now())
  
  map         Map      @relation(fields: [mapId], references: [id])
}

model BPSession {
  id           String     @id @default(cuid())
  matchId      String
  mapPool      String[]
  currentPhase String     @default("ban")
  activeTeam   String     @default("A")
  countdown    Int        @default(0)
  status       String     @default("active")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  match        Match      @relation(fields: [matchId], references: [id])
  actions      BPAction[]
}

model BPAction {
  id        String   @id @default(cuid())
  sessionId String
  type      String
  team      String
  map       String
  order     Int
  createdAt DateTime @default(now())
  
  session   BPSession @relation(fields: [sessionId], references: [id])
}

model Sponsor {
  id              String  @id @default(cuid())
  eventId         String
  name            String
  logo            String
  tier            String
  displayDuration Int     @default(5)
  
  event           Event   @relation(fields: [eventId], references: [id])
}
```

### 5. 错误处理与降级方案

#### 断线重连

```typescript
// lib/reconnection.ts
import { socketService } from './socket';

class ReconnectionManager {
  private reconnectAttempts = 0;
  private maxAttempts = 5;
  private backupData: any = null;

  async handleDisconnection() {
    // 保存当前状态到本地
    this.saveToLocalStorage();
    
    // 尝试重连
    while (this.reconnectAttempts < this.maxAttempts) {
      await this.sleep(this.getBackoffDelay());
      
      try {
        await socketService.connect(process.env.NEXT_PUBLIC_SOCKET_URL!);
        this.reconnectAttempts = 0;
        this.restoreFromLocalStorage();
        return true;
      } catch (error) {
        this.reconnectAttempts++;
      }
    }
    
    // 连接失败，启用离线模式
    this.enableOfflineMode();
    return false;
  }

  private getBackoffDelay() {
    // 指数退避算法
    return Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
  }

  private saveToLocalStorage() {
    const state = {
      match: store.getState().match,
      bp: store.getState().bp,
      timestamp: Date.now()
    };
    localStorage.setItem('backup-state', JSON.stringify(state));
  }

  private restoreFromLocalStorage() {
    const backup = localStorage.getItem('backup-state');
    if (backup) {
      const state = JSON.parse(backup);
      // 检查数据是否过期（5分钟）
      if (Date.now() - state.timestamp < 5 * 60 * 1000) {
        store.setState(state);
      }
    }
  }

  private enableOfflineMode() {
    // 显示离线提示
    toast.error('服务器连接失败，已进入离线模式');
    
    // 禁用实时功能
    store.setState({ offlineMode: true });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const reconnectionManager = new ReconnectionManager();
```

#### 数据校验

```typescript
// lib/validation.ts
import { z } from 'zod';

// Match数据校验
export const MatchSchema = z.object({
  id: z.string(),
  teamA: z.object({
    id: z.string(),
    name: z.string(),
    score: z.number().min(0)
  }),
  teamB: z.object({
    id: z.string(),
    name: z.string(),
    score: z.number().min(0)
  }),
  format: z.enum(['BO1', 'BO3', 'BO5']),
  currentMap: z.number().min(1),
  status: z.enum(['upcoming', 'live', 'finished'])
});

// BP数据校验
export const BPSessionSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  mapPool: z.array(z.string()).length(7),
  actions: z.array(z.object({
    type: z.enum(['ban', 'pick']),
    team: z.enum(['A', 'B']),
    map: z.string()
  })),
  currentPhase: z.enum(['ban', 'pick']),
  activeTeam: z.enum(['A', 'B'])
});

// 数据校验中间件
export function validateData<T>(schema: z.ZodSchema<T>, data: any): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Data validation failed:', error);
    throw new Error('Invalid data format');
  }
}
```

---

## 部署指南

### Docker部署

#### Dockerfile

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SOCKET_URL=http://backend:3001
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/cs2overlay
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cs2overlay
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

### Nginx配置

```nginx
# nginx.conf
upstream frontend {
  server frontend:3000;
}

upstream backend {
  server backend:3001;
}

server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;

  ssl_certificate /etc/nginx/ssl/cert.pem;
  ssl_certificate_key /etc/nginx/ssl/key.pem;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Backend API
  location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
  }

  # WebSocket
  location /socket.io {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/cs2-overlay.git
cd cs2-overlay

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件

# 3. 构建并启动
docker-compose up -d

# 4. 检查状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f

# 6. 数据库迁移
docker-compose exec backend npm run prisma:migrate

# 7. 创建管理员账户（如有）
docker-compose exec backend npm run seed
```

### 性能优化

#### 前端优化

```typescript
// next.config.js
module.exports = {
  compress: true,
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

#### 缓存策略

```typescript
// 使用React Query缓存
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 使用手册

### OBS配置指南

#### 1. 添加浏览器源

1. 在OBS中右键点击场景
2. 选择"添加" → "浏览器"
3. 配置参数：
   - **URL**: `http://localhost:3000/overlay/scoreboard`
   - **宽度**: 1920
   - **高度**: 1080
   - **FPS**: 60
   - **勾选**: "当源不可见时关闭源"
   - **自定义CSS**: 
     ```css
     body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }
     ```

#### 2. 推荐场景配置

**开场场景**:
- 游戏画面
- 比分板 (Scoreboard)
- 顶部信息栏 (Top Bar)

**BP场景**:
- BP界面 (BP)
- 背景音乐

**比赛中场景**:
- 游戏画面
- 比分板
- 选手摄像头 + 边框

**中场休息**:
- 休息画面 (Break)
- 赞助商展示

#### 3. 快捷键设置

建议设置以下快捷键：
- F1: 显示/隐藏比分板
- F2: 显示/隐藏BP
- F3: 显示/隐藏选手信息
- F4: 切换到比赛场景
- F5: 切换到中场场景

### 控制面板使用

#### 比赛前准备

1. **创建比赛**
   - 进入 `/admin/dashboard`
   - 点击"新建比赛"
   - 填写比赛信息（队伍、赛制等）
   - 保存

2. **配置队伍信息**
   - 上传队伍Logo
   - 设置队名和缩写
   - 添加选手名单

3. **设置BP流程**
   - 选择赛制（BO1/BO3/BO5）
   - 加载对应BP流程预设

#### 比赛中操作

1. **控制比分**
   - 使用 +1/-1 按钮调整比分
   - 或直接输入分数

2. **BP操作**
   - 点击地图进行Ban/Pick
   - 系统自动切换队伍和阶段
   - 可撤销上一步操作

3. **Overlay控制**
   - 使用开关控制显示/隐藏
   - 切换预设场景

### 常见问题

#### Q: Overlay不显示？
A: 检查：
1. URL是否正确
2. 服务是否运行
3. WebSocket是否连接
4. 浏览器控制台是否有错误

#### Q: 动画卡顿？
A: 尝试：
1. 降低OBS的FPS设置
2. 减少同时显示的overlay数量
3. 检查CPU占用

#### Q: WebSocket频繁断开？
A: 检查：
1. 网络连接
2. 防火墙设置
3. 服务器负载
4. Nginx配置

#### Q: GSI数据不更新？
A: 检查：
1. CS2游戏是否运行
2. GSI配置文件路径是否正确
3. Token是否匹配
4. 后端GSI服务器端口是否开启
5. 防火墙是否阻止localhost连接

#### Q: Electron应用无法启动？
A: 尝试：
1. 删除node_modules重新安装
2. 检查是否有端口冲突
3. 查看Electron开发者工具控制台
4. 检查系统兼容性（需要Windows 10+/macOS 10.13+）

### GSI配置详细指南

#### 1. 找到CS2配置目录

**Windows**:
```
C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
```

**macOS**:
```
~/Library/Application Support/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/
```

**Linux**:
```
~/.steam/steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/cfg/
```

#### 2. 创建配置文件

文件名: `gamestate_integration_overlay.cfg`

完整配置内容:
```cfg
"CS2 Overlay Integration v1.0"
{
    "uri"               "http://localhost:3001/gsi"
    "timeout"           "5.0"
    "buffer"            "0.1"
    "throttle"          "0.5"
    "heartbeat"         "30.0"
    "auth"
    {
        "token"         "CS2_OVERLAY_SECRET_2024"
    }
    "data"
    {
        "provider"            "1"      // 游戏信息
        "map"                 "1"      // 地图和比分
        "round"               "1"      // 回合信息
        "player_id"           "1"      // 本地玩家ID
        "player_state"        "1"      // 玩家状态
        "player_weapons"      "1"      // 武器信息
        "player_match_stats"  "1"      // 比赛统计
        "allplayers"          "1"      // 所有玩家数据
        "bomb"                "1"      // C4信息
        "phase_countdowns"    "1"      // 倒计时
    }
}
```

#### 3. 验证GSI配置

启动CS2后，在后端日志中应该看到：
```
[GSI] Received heartbeat from CS2
[GSI] Map: de_dust2, Round: 1, Phase: warmup
```

#### 4. 测试GSI连接

使用curl测试：
```bash
curl -X POST http://localhost:3001/gsi \
  -H "Content-Type: application/json" \
  -d '{"auth":{"token":"CS2_OVERLAY_SECRET_2024"},"map":{"name":"de_dust2"}}'
```

### Electron使用指南

#### 启动桌面应用

**开发模式**:
```bash
cd packages/desktop
pnpm dev
```

**生产模式**:
双击安装后的应用图标

#### 基本操作

1. **系统托盘**
   - 双击托盘图标打开控制面板
   - 右键托盘图标显示菜单
   - 最小化时隐藏到托盘

2. **全局快捷键**
   - `Ctrl+Shift+O`: 打开控制面板
   - `F1-F5`: 切换Overlay场景
   - `Ctrl+Q`: 退出应用

3. **自动启动**
   - 设置 → 开机自动启动
   - Windows: 添加到启动项
   - macOS: 登录项设置

4. **更新检查**
   - 帮助 → 检查更新
   - 支持自动下载安装

#### 打包分发

**Windows (.exe)**:
```bash
pnpm build:win
# 输出: dist-electron/CS2-Overlay-Setup-1.0.0.exe
```

**macOS (.dmg)**:
```bash
pnpm build:mac
# 输出: dist-electron/CS2-Overlay-1.0.0.dmg
```

**Linux (.AppImage)**:
```bash
pnpm build:linux
# 输出: dist-electron/CS2-Overlay-1.0.0.AppImage
```

---

## 附录

### A. 技术栈完整清单

#### 前端依赖 (packages/web)

```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.2.0",
    "framer-motion": "11.0.0",
    "socket.io-client": "4.7.0",
    "zustand": "4.5.0",
    "@tanstack/react-query": "5.0.0",
    "tailwindcss": "3.4.0",
    "zod": "3.22.0",
    "date-fns": "3.0.0",
    "recharts": "2.10.0",
    "lucide-react": "0.300.0"
  },
  "devDependencies": {
    "@types/node": "20.10.0",
    "@types/react": "18.2.0",
    "eslint": "8.56.0",
    "prettier": "3.1.0"
  }
}
```

#### 桌面应用依赖 (packages/desktop)

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "socket.io-client": "4.7.0",
    "zustand": "4.5.0",
    "tailwindcss": "3.4.0"
  },
  "devDependencies": {
    "electron": "28.0.0",
    "electron-builder": "24.9.0",
    "vite": "5.0.0",
    "@vitejs/plugin-react": "4.2.0",
    "typescript": "5.2.0"
  }
}
```

#### 后端依赖 (packages/server)

```json
{
  "dependencies": {
    "express": "4.18.2",
    "socket.io": "4.7.0",
    "prisma": "5.8.0",
    "@prisma/client": "5.8.0",
    "cors": "2.8.5",
    "dotenv": "16.3.1",
    "zod": "3.22.0",
    "bcrypt": "5.1.1",
    "jsonwebtoken": "9.0.2",
    "helmet": "7.1.0",
    "rate-limiter-flexible": "3.0.0"
  },
  "devDependencies": {
    "@types/express": "4.17.21",
    "@types/cors": "2.8.17",
    "nodemon": "3.0.2",
    "ts-node": "10.9.2"
  }
}
```

#### 共享包依赖 (packages/shared)

```json
{
  "dependencies": {
    "zod": "3.22.0"
  },
  "devDependencies": {
    "typescript": "5.2.0"
  }
}
```

#### Monorepo根依赖

```json
{
  "devDependencies": {
    "turbo": "1.11.0",
    "typescript": "5.2.0",
    "prettier": "3.1.0",
    "eslint": "8.56.0"
  }
}
```

### B. Git工作流

#### 分支策略

```
main          - 生产环境
  └─ develop  - 开发环境
      ├─ feature/scoreboard
      ├─ feature/bp-system
      └─ feature/admin-panel
```

#### Commit规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具

例如：
feat(overlay): add scoreboard animation
fix(bp): resolve pick order issue
docs: update deployment guide
```

### C. 测试清单

#### 功能测试

- [ ] 比分板显示正确
- [ ] 比分更新实时同步
- [ ] BP流程完整可用
- [ ] 所有overlay可切换
- [ ] 控制面板功能正常
- [ ] 数据持久化正常
- [ ] **GSI数据实时接收**
- [ ] **GSI自动比分更新**
- [ ] **Electron应用正常启动**
- [ ] **Electron托盘图标功能**
- [ ] **Electron快捷键响应**

#### 性能测试

- [ ] Overlay渲染60fps
- [ ] WebSocket延迟<100ms
- [ ] 内存占用稳定
- [ ] 长时间运行无泄漏
- [ ] **GSI数据处理延迟<50ms**
- [ ] **Electron应用内存占用<200MB**

#### 兼容性测试

- [ ] OBS 28+ 兼容
- [ ] Chrome/Edge浏览器
- [ ] 1920x1080分辨率
- [ ] Windows/Mac/Linux
- [ ] **CS2最新版本GSI兼容**
- [ ] **Electron在Windows 10+运行**
- [ ] **Electron在macOS 10.13+运行**

### D. 资源链接

**官方文档**:
- **OBS官网**: https://obsproject.com/
- **Socket.io文档**: https://socket.io/docs/
- **Framer Motion**: https://www.framer.com/motion/
- **Next.js文档**: https://nextjs.org/docs
- **Prisma文档**: https://www.prisma.io/docs
- **Electron文档**: https://www.electronjs.org/docs
- **Turborepo文档**: https://turbo.build/repo/docs
- **pnpm文档**: https://pnpm.io/

**CS2 GSI**:
- **GSI官方文档**: https://developer.valvesoftware.com/wiki/Counter-Strike:_Global_Offensive_Game_State_Integration
- **社区GSI示例**: https://github.com/search?q=cs2+gsi

**Electron相关**:
- **electron-builder**: https://www.electron.build/
- **Vite + Electron**: https://github.com/electron-vite/electron-vite-vue

**社区资源**:
- **CS2 Overlay社区**: https://www.reddit.com/r/GlobalOffensive/
- **GSI讨论**: Discord服务器（可创建）

### E. 团队协作

#### 角色分工

- **前端开发**: Overlay组件、控制面板UI
- **后端开发**: API、WebSocket、GSI集成
- **桌面应用开发**: Electron应用、打包发布
- **UI/UX设计**: 界面设计、动画效果
- **测试**: 功能测试、性能测试、GSI测试
- **运维**: 部署、监控、维护、更新分发

#### 沟通渠道

- **日会**: 每日同步进度（15分钟）
- **周会**: 回顾与规划
- **文档**: Notion/飞书协作
- **代码**: GitHub PR Review
- **问题追踪**: GitHub Issues
- **实时沟通**: Discord/Slack

---

## 结语

本文档提供了CS2赛事直播Overlay系统的完整开发指南，包括最新的GSI集成和Electron桌面应用开发。

**核心优势**:
1. ✅ **GSI自动化** - 告别手动输入，实时准确
2. ✅ **Electron桌面应用** - 专业导播工具体验
3. ✅ **Monorepo架构** - 代码组织清晰，易于维护
4. ✅ **完整工作流** - 从开发到打包分发

**开发建议**:
1. 保持代码整洁和文档更新
2. 优先实现GSI集成（Week 3.5），这是导播系统的核心
3. 注重Electron应用的用户体验
4. 做好错误处理和降级方案（GSI断开时手动输入）
5. 及时测试GSI在不同CS2版本的兼容性

**重要提醒**:
- GSI是官方API，安全可靠
- Electron打包需要签名证书（生产环境）
- Monorepo需要合理规划共享代码
- 定期备份配置和数据

祝开发顺利！🚀

**特别感谢**:
- Valve Software - CS2 GSI API
- Electron团队 - 优秀的桌面框架
- 社区贡献者 - 开源精神

---

**版本**: v2.0 (Updated with GSI & Electron)
**最后更新**: 2025-01-30
**许可**: MIT License