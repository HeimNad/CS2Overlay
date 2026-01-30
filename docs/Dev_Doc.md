\# CS2 Major级别赛事直播Overlay系统 - 完整项目文档



\## 📋 目录



1\. \[项目概述](#项目概述)

2\. \[技术架构](#技术架构)

3\. \[功能需求](#功能需求)

4\. \[开发计划](#开发计划)

5\. \[技术选型](#技术选型)

6\. \[系统设计](#系统设计)

7\. \[实现细节](#实现细节)

8\. \[部署指南](#部署指南)

9\. \[使用手册](#使用手册)

10\. \[附录](#附录)



---



\## 项目概述



\### 项目目标

开发一套完整的CS2赛事直播Overlay系统，支持比分显示、BP流程、选手信息等所有赛事所需的图形叠加层，并提供完整的后台控制面板。



\### 核心特性

\- ✅ 实时比分更新

\- ✅ BP（Ban/Pick）系统

\- ✅ 多种Overlay场景

\- ✅ 可视化控制面板

\- ✅ OBS浏览器源集成

\- ✅ 动画效果支持

\- ✅ 主题自定义



\### 目标用户

\- 赛事主办方

\- 直播导播

\- 赛事数据员

\- 内容创作者



---



\## 技术架构



\### 整体架构图



```

┌─────────────────────────────────────────────────────────┐

│                      OBS Studio                          │

│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │

│  │ Browser Src  │  │ Browser Src  │  │ Browser Src  │  │

│  │  Scoreboard  │  │     BP       │  │ Lower-third  │  │

│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │

└─────────┼──────────────────┼──────────────────┼──────────┘

&nbsp;         │                  │                  │

&nbsp;         └──────────────────┼──────────────────┘

&nbsp;                            │ WebSocket

&nbsp;         ┌──────────────────┴──────────────────┐

&nbsp;         │                                     │

┌─────────▼─────────┐              ┌───────────▼──────────┐

│   Frontend Web    │              │   Admin Dashboard    │

│  (Overlay Pages)  │              │  (Control Panel)     │

│                   │              │                      │

│  - React/Next.js  │◄─────────────┤  - Match Control    │

│  - TypeScript     │   Commands   │  - BP Control       │

│  - Framer Motion  │              │  - Scene Switch     │

└─────────┬─────────┘              └──────────┬───────────┘

&nbsp;         │                                   │

&nbsp;         └──────────────┬────────────────────┘

&nbsp;                        │ Socket.io

&nbsp;             ┌──────────▼──────────┐

&nbsp;             │   Backend Server    │

&nbsp;             │                     │

&nbsp;             │  - Node.js/Express  │

&nbsp;             │  - Socket.io        │

&nbsp;             │  - REST API         │

&nbsp;             └──────────┬──────────┘

&nbsp;                        │

&nbsp;             ┌──────────▼──────────┐

&nbsp;             │     Database        │

&nbsp;             │  PostgreSQL/MongoDB │

&nbsp;             └─────────────────────┘

```



\### 技术栈



\#### 前端

\- \*\*框架\*\*: Next.js 16 + TypeScript

\- \*\*状态管理\*\*: Zustand

\- \*\*动画\*\*: Framer Motion

\- \*\*样式\*\*: Tailwind CSS

\- \*\*WebSocket\*\*: Socket.io-client

\- \*\*图表\*\*: Recharts (可选)



\#### 后端

\- \*\*运行时\*\*: Node.js 18+

\- \*\*框架\*\*: Express

\- \*\*WebSocket\*\*: Socket.io

\- \*\*验证\*\*: Zod

\- \*\*ORM\*\*: Prisma (可选)



\#### 数据库

\- \*\*主数据库\*\*: PostgreSQL 或 MongoDB

\- \*\*缓存\*\*: Redis (可选)



\#### DevOps

\- \*\*容器化\*\*: Docker + Docker Compose

\- \*\*进程管理\*\*: PM2

\- \*\*反向代理\*\*: Nginx



---



\## 功能需求



\### 1. Overlay页面模块



\#### 1.1 比分板 (Scoreboard)

\*\*路由\*\*: `/overlay/scoreboard`



\*\*功能需求\*\*:

\- 显示双方队伍名称和Logo

\- 实时比分更新（局分）

\- 当前地图名称

\- 当前回合数

\- BO3/BO5系列赛进度

\- 队伍经济显示（可选）



\*\*交互需求\*\*:

\- 比分更新时播放动画

\- 支持显示/隐藏切换

\- 入场/退场动画



\*\*设计要求\*\*:

\- 透明背景

\- 尺寸: 1920x1080 适配

\- 刷新率: 60fps



\#### 1.2 BP系统 (Ban/Pick)

\*\*路由\*\*: `/overlay/bp`



\*\*功能需求\*\*:

\- 地图池显示（7张地图）

\- Ban阶段可视化

\- Pick阶段可视化

\- 当前操作队伍高亮

\- 倒计时显示

\- Ban/Pick顺序指示



\*\*流程支持\*\*:

\- BO1: Ban-Ban-Ban-Ban-Ban-Ban (剩余1图)

\- BO3: Ban-Ban-Pick-Pick-Ban-Ban (剩余1图)

\- BO5: Pick-Pick-Ban-Ban-Pick-Pick-Ban



\*\*交互需求\*\*:

\- Ban/Pick操作实时显示

\- 操作确认动画

\- 支持撤销操作



\#### 1.3 选手信息条 (Lower Third)

\*\*路由\*\*: `/overlay/lower-third`



\*\*功能需求\*\*:

\- 选手游戏ID

\- 真实姓名

\- 国籍/头像

\- 当前KDA

\- 击杀数高亮



\*\*交互需求\*\*:

\- 滑入/滑出动画

\- 支持单人/五人模式

\- 自动轮播（可选）



\#### 1.4 顶部信息栏 (Top Bar)

\*\*路由\*\*: `/overlay/top-bar`



\*\*功能需求\*\*:

\- 赛事名称

\- 比赛阶段（小组赛/淘汰赛）

\- 当前时间

\- 赞助商Logo



\#### 1.5 地图禁选 (Map Veto)

\*\*路由\*\*: `/overlay/map-veto`



\*\*功能需求\*\*:

\- 完整veto流程展示

\- 已ban/pick地图状态

\- 最终地图池结果



\#### 1.6 辅助Overlay

\- \*\*倒计时器\*\* `/overlay/countdown` - 暂停倒计时

\- \*\*回放标识\*\* `/overlay/replay` - REPLAY字样显示

\- \*\*中场休息\*\* `/overlay/break` - 休息画面

\- \*\*赞助商\*\* `/overlay/sponsor` - 赞助商轮播

\- \*\*选手摄像头边框\*\* `/overlay/player-cam` - 摄像头装饰框



\### 2. 控制面板模块



\#### 2.1 主控制台 (Dashboard)

\*\*路由\*\*: `/admin/dashboard`



\*\*功能需求\*\*:

\- 比赛总览

\- 快速操作面板

\- 当前overlay状态

\- WebSocket连接状态

\- 系统日志



\#### 2.2 比赛控制 (Match Control)

\*\*路由\*\*: `/admin/match-control`



\*\*功能需求\*\*:

\- 队伍信息编辑

&nbsp; - 队名、Logo、简称

&nbsp; - 选手名单

\- 比分控制

&nbsp; - +1/-1 按钮

&nbsp; - 直接输入

&nbsp; - 重置功能

\- 地图选择

\- 回合数控制

\- 比赛阶段切换



\*\*操作记录\*\*:

\- 所有操作记录日志

\- 支持撤销/重做



\#### 2.3 BP控制面板 (BP Control)

\*\*路由\*\*: `/admin/bp-control`



\*\*功能需求\*\*:

\- 地图池管理

\- Ban操作

\- Pick操作

\- 倒计时控制

\- 当前队伍切换

\- BP流程预设加载

\- 重置BP流程



\*\*预设方案\*\*:

\- BO1流程

\- BO3流程

\- BO5流程

\- 自定义流程



\#### 2.4 场景切换器 (Scene Switcher)

\*\*路由\*\*: `/admin/scenes`



\*\*功能需求\*\*:

\- 预设场景管理

&nbsp; - 开场场景

&nbsp; - BP场景

&nbsp; - 比赛中场景

&nbsp; - 中场休息场景

&nbsp; - 结束场景

\- 一键切换overlay组合

\- 场景编辑器



\#### 2.5 Overlay开关控制

\*\*路由\*\*: `/admin/overlay-toggle`



\*\*功能需求\*\*:

\- 所有overlay显示/隐藏开关

\- 透明度控制

\- 位置微调（可选）



\### 3. 数据管理模块



\#### 3.1 队伍管理

\- CRUD操作

\- Logo上传

\- 历史数据



\#### 3.2 选手管理

\- 选手信息

\- 统计数据

\- 头像管理



\#### 3.3 赛事管理

\- 赛事创建

\- 赛程安排

\- 对阵配置



---



\## 开发计划



\### 阶段划分（8周计划）



\#### Week 1: 基础搭建 (2025-02-03 ~ 02-09)



\*\*Day 1-2: 项目初始化\*\*

\- \[ ] 创建Git仓库

\- \[ ] 前端项目搭建 (Next.js)

\- \[ ] 后端项目搭建 (Express)

\- \[ ] Docker环境配置

\- \[ ] 数据库设计



\*\*交付物\*\*:

\- 项目脚手架

\- 开发环境文档

\- 数据库Schema



\*\*Day 3-4: WebSocket基础\*\*

\- \[ ] 后端Socket.io服务

\- \[ ] 前端Socket连接

\- \[ ] 事件定义

\- \[ ] 心跳检测

\- \[ ] 断线重连机制



\*\*交付物\*\*:

\- WebSocket通信Demo

\- 事件文档



\*\*Day 5-7: 数据结构设计\*\*

\- \[ ] TypeScript类型定义

\- \[ ] 数据模型设计

\- \[ ] API接口定义

\- \[ ] 状态管理架构



\*\*交付物\*\*:

\- 完整类型定义文件

\- API文档v1.0



---



\#### Week 2: 核心Overlay (2025-02-10 ~ 02-16)



\*\*Day 8-10: 比分板开发\*\*

\- \[ ] UI组件开发

\- \[ ] WebSocket集成

\- \[ ] 动画实现

\- \[ ] OBS测试



\*\*交付物\*\*:

\- 可用的比分板Overlay

\- OBS配置文档



\*\*Day 11-14: BP系统开发\*\*

\- \[ ] BP UI设计实现

\- \[ ] Ban/Pick逻辑

\- \[ ] 倒计时功能

\- \[ ] 流程状态机

\- \[ ] 动画效果



\*\*交付物\*\*:

\- 完整BP系统

\- BP流程测试报告



---



\#### Week 3: 控制面板 (2025-02-17 ~ 02-23)



\*\*Day 15-17: 主控制台\*\*

\- \[ ] Dashboard布局

\- \[ ] 比分控制组件

\- \[ ] 队伍管理界面

\- \[ ] WebSocket发送



\*\*Day 18-19: BP控制面板\*\*

\- \[ ] BP操作界面

\- \[ ] 预设方案管理

\- \[ ] 撤销/重做功能



\*\*Day 20-21: 场景切换\*\*

\- \[ ] 场景管理器

\- \[ ] 预设场景配置

\- \[ ] 一键切换功能



\*\*交付物\*\*:

\- 完整控制面板

\- 操作手册v1.0



---



\#### Week 4: 扩展功能 (2025-02-24 ~ 03-02)



\*\*Day 22-23: 选手信息条\*\*

\- \[ ] Lower Third组件

\- \[ ] 动画效果

\- \[ ] 数据绑定



\*\*Day 24-25: 地图Veto\*\*

\- \[ ] Map Veto UI

\- \[ ] 流程控制

\- \[ ] 结果展示



\*\*Day 26-27: 辅助Overlay\*\*

\- \[ ] 倒计时器

\- \[ ] 回放标识

\- \[ ] 中场休息画面

\- \[ ] 赞助商展示



\*\*Day 28: 集成测试\*\*

\- \[ ] 所有overlay联动测试

\- \[ ] 性能测试

\- \[ ] 兼容性测试



\*\*交付物\*\*:

\- 所有Overlay页面

\- 测试报告



---



\#### Week 5: 视觉优化 (2025-03-03 ~ 03-09)



\*\*Day 29-31: UI/UX打磨\*\*

\- \[ ] 视觉效果优化

\- \[ ] 动画流畅度调整

\- \[ ] 字体和排版



\*\*Day 32-33: 主题系统\*\*

\- \[ ] CSS变量系统

\- \[ ] 主题切换功能

\- \[ ] 预设主题（3-5套）



\*\*Day 34-35: 性能优化\*\*

\- \[ ] 组件懒加载

\- \[ ] 图片优化

\- \[ ] WebSocket节流

\- \[ ] 内存泄漏检查



\*\*交付物\*\*:

\- 优化后的系统

\- 性能测试报告



---



\#### Week 6: 稳定性 (2025-03-10 ~ 03-16)



\*\*Day 36-38: 错误处理\*\*

\- \[ ] 异常捕获机制

\- \[ ] 降级方案

\- \[ ] 错误日志系统

\- \[ ] 数据备份恢复



\*\*Day 39-40: 部署准备\*\*

\- \[ ] 生产环境配置

\- \[ ] Docker镜像构建

\- \[ ] CI/CD流程

\- \[ ] 监控告警



\*\*Day 41-42: 文档编写\*\*

\- \[ ] 用户使用手册

\- \[ ] 部署运维文档

\- \[ ] API文档完善

\- \[ ] 故障排查手册



\*\*交付物\*\*:

\- 生产就绪版本

\- 完整文档集



---



\#### Week 7-8: 高级功能 (2025-03-17 ~ 03-30)



\*\*可选功能开发\*\*:

\- \[ ] 数据统计面板

\- \[ ] 历史数据查询

\- \[ ] 自动化集成

\- \[ ] 多语言支持

\- \[ ] 音效系统

\- \[ ] 移动端控制（PWA）



\*\*交付物\*\*:

\- 功能完整的系统

\- v1.0正式版本



---



\### 里程碑检查点



\#### Milestone 1: MVP完成 (Week 2结束)

\*\*验收标准\*\*:

\- ✅ 比分板可在OBS中正常显示

\- ✅ 控制面板可更新比分

\- ✅ WebSocket实时同步正常

\- ✅ 基础BP系统可用



\*\*演示要求\*\*:

\- 模拟一场BO3比赛完整流程



\#### Milestone 2: 功能完整 (Week 4结束)

\*\*验收标准\*\*:

\- ✅ 所有主要Overlay完成

\- ✅ 控制面板功能完整

\- ✅ 可进行完整赛事演练

\- ✅ 动画效果流畅



\*\*演示要求\*\*:

\- 模拟真实赛事2小时直播



\#### Milestone 3: 生产就绪 (Week 6结束)

\*\*验收标准\*\*:

\- ✅ 系统稳定运行3小时+

\- ✅ 性能达标（60fps）

\- ✅ 文档齐全

\- ✅ 部署方案完整



\*\*交付要求\*\*:

\- 可独立部署使用

\- 提供培训材料



---



\## 技术选型



\### 前端技术栈详解



\#### 为什么选择 Next.js?

1\. \*\*SSR支持\*\* - 首屏加载优化

2\. \*\*文件路由\*\* - 天然支持多页面

3\. \*\*API Routes\*\* - 可内置简单后端

4\. \*\*优秀生态\*\* - 丰富的插件

5\. \*\*开发体验\*\* - 热重载、TypeScript支持



\#### 为什么选择 Framer Motion?

1\. \*\*声明式API\*\* - 代码简洁

2\. \*\*性能优秀\*\* - GPU加速

3\. \*\*手势支持\*\* - 拖拽等交互

4\. \*\*Spring动画\*\* - 自然的物理动画

5\. \*\*React集成\*\* - 无缝使用



\#### 为什么选择 Zustand?

1\. \*\*轻量级\*\* - 仅1kb

2\. \*\*简单易用\*\* - 无需Provider

3\. \*\*TypeScript友好\*\* - 完美类型推导

4\. \*\*DevTools\*\* - 调试方便

5\. \*\*性能好\*\* - 细粒度更新



\### 后端技术栈详解



\#### 为什么选择 Express?

1\. \*\*成熟稳定\*\* - 久经考验

2\. \*\*中间件丰富\*\* - 生态完善

3\. \*\*灵活\*\* - 高度可定制

4\. \*\*文档齐全\*\* - 易学习

5\. \*\*社区活跃\*\* - 问题解决快



\#### 为什么选择 Socket.io?

1\. \*\*自动降级\*\* - 兼容性好

2\. \*\*房间机制\*\* - 易实现分组

3\. \*\*重连机制\*\* - 稳定性高

4\. \*\*二进制支持\*\* - 传输效率

5\. \*\*双向通信\*\* - 实时性强



\### 数据库选择建议



\#### PostgreSQL (推荐)

\*\*适用场景\*\*:

\- 需要复杂查询

\- 数据关系复杂

\- ACID要求高



\*\*优势\*\*:

\- 功能强大

\- 扩展性好

\- 开源免费



\#### MongoDB

\*\*适用场景\*\*:

\- 数据结构灵活

\- 快速迭代

\- 横向扩展需求



\*\*优势\*\*:

\- Schema灵活

\- 查询简单

\- 易于上手



---



\## 系统设计



\### 数据模型设计



\#### 核心实体



```typescript

// Match - 比赛

interface Match {

&nbsp; id: string;

&nbsp; eventId: string;           // 关联赛事

&nbsp; teamA: Team;

&nbsp; teamB: Team;

&nbsp; format: 'BO1' | 'BO3' | 'BO5';

&nbsp; currentMap: number;        // 当前第几张图

&nbsp; maps: Map\[];

&nbsp; status: 'upcoming' | 'live' | 'finished';

&nbsp; startTime: Date;

&nbsp; endTime?: Date;

&nbsp; createdAt: Date;

&nbsp; updatedAt: Date;

}



// Team - 队伍

interface Team {

&nbsp; id: string;

&nbsp; name: string;

&nbsp; shortName: string;         // 缩写（3-4字符）

&nbsp; logo: string;              // Logo URL

&nbsp; country: string;

&nbsp; players: Player\[];

&nbsp; score: number;             // 当前比分

&nbsp; economy?: number;          // 经济

&nbsp; createdAt: Date;

&nbsp; updatedAt: Date;

}



// Player - 选手

interface Player {

&nbsp; id: string;

&nbsp; gameId: string;            // 游戏ID

&nbsp; realName: string;

&nbsp; country: string;

&nbsp; avatar?: string;

&nbsp; teamId: string;

&nbsp; stats?: PlayerStats;

&nbsp; createdAt: Date;

&nbsp; updatedAt: Date;

}



// PlayerStats - 选手统计

interface PlayerStats {

&nbsp; kills: number;

&nbsp; deaths: number;

&nbsp; assists: number;

&nbsp; adr: number;              // 平均伤害

&nbsp; rating: number;           // Rating 2.0

}



// Map - 地图

interface Map {

&nbsp; id: string;

&nbsp; matchId: string;

&nbsp; name: string;

&nbsp; order: number;            // 第几张图

&nbsp; scoreA: number;

&nbsp; scoreB: number;

&nbsp; status: 'upcoming' | 'live' | 'finished';

&nbsp; rounds: Round\[];

&nbsp; winner?: 'A' | 'B';

&nbsp; createdAt: Date;

&nbsp; updatedAt: Date;

}



// Round - 回合

interface Round {

&nbsp; id: string;

&nbsp; mapId: string;

&nbsp; roundNumber: number;

&nbsp; winner: 'A' | 'B';

&nbsp; reason: 'elimination' | 'bomb' | 'time' | 'defuse';

&nbsp; mvp?: string;             // 玩家ID

&nbsp; createdAt: Date;

}



// BPSession - BP会话

interface BPSession {

&nbsp; id: string;

&nbsp; matchId: string;

&nbsp; mapPool: string\[];        // 地图池

&nbsp; actions: BPAction\[];

&nbsp; currentPhase: 'ban' | 'pick';

&nbsp; activeTeam: 'A' | 'B';

&nbsp; countdown: number;

&nbsp; status: 'active' | 'completed';

&nbsp; createdAt: Date;

&nbsp; updatedAt: Date;

}



// BPAction - BP操作

interface BPAction {

&nbsp; id: string;

&nbsp; sessionId: string;

&nbsp; type: 'ban' | 'pick';

&nbsp; team: 'A' | 'B';

&nbsp; map: string;

&nbsp; order: number;

&nbsp; timestamp: Date;

}



// OverlayState - Overlay状态

interface OverlayState {

&nbsp; scoreboard: {

&nbsp;   visible: boolean;

&nbsp;   opacity: number;

&nbsp; };

&nbsp; bp: {

&nbsp;   visible: boolean;

&nbsp;   opacity: number;

&nbsp; };

&nbsp; lowerThird: {

&nbsp;   visible: boolean;

&nbsp;   player?: Player;

&nbsp; };

&nbsp; // ... 其他overlay

}



// Event - 赛事

interface Event {

&nbsp; id: string;

&nbsp; name: string;

&nbsp; logo: string;

&nbsp; startDate: Date;

&nbsp; endDate: Date;

&nbsp; format: string;

&nbsp; sponsors: Sponsor\[];

&nbsp; createdAt: Date;

&nbsp; updatedAt: Date;

}



// Sponsor - 赞助商

interface Sponsor {

&nbsp; id: string;

&nbsp; name: string;

&nbsp; logo: string;

&nbsp; tier: 'title' | 'main' | 'partner';

&nbsp; displayDuration: number;  // 展示时长（秒）

}

```



\### WebSocket事件定义



\#### 客户端 → 服务端



```typescript

// 连接事件

'client:connect' - 客户端连接

'client:disconnect' - 客户端断开



// 比赛控制

'match:scoreUpdate' - 更新比分

&nbsp; payload: { team: 'A' | 'B', delta: number }



'match:roundUpdate' - 更新回合

&nbsp; payload: { mapId: string, winner: 'A' | 'B' }



'match:statusChange' - 比赛状态变更

&nbsp; payload: { status: MatchStatus }



// BP控制

'bp:ban' - Ban地图

&nbsp; payload: { team: 'A' | 'B', map: string }



'bp:pick' - Pick地图

&nbsp; payload: { team: 'A' | 'B', map: string }



'bp:undo' - 撤销操作

&nbsp; payload: { actionId: string }



'bp:reset' - 重置BP

&nbsp; payload: { sessionId: string }



// Overlay控制

'overlay:toggle' - 切换显示

&nbsp; payload: { name: string, visible: boolean }



'overlay:scene' - 切换场景

&nbsp; payload: { sceneId: string }

```



\#### 服务端 → 客户端



```typescript

// 数据推送

'match:update' - 比赛数据更新

&nbsp; payload: Match



'bp:update' - BP状态更新

&nbsp; payload: BPSession



'overlay:update' - Overlay状态更新

&nbsp; payload: OverlayState



'player:statsUpdate' - 选手数据更新

&nbsp; payload: PlayerStats\[]



// 系统消息

'system:error' - 错误消息

&nbsp; payload: { code: string, message: string }



'system:notification' - 通知消息

&nbsp; payload: { type: 'info' | 'warning' | 'success', message: string }

```



\### API接口设计



\#### RESTful API



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



\### 状态管理架构



\#### Zustand Store结构



```typescript

// stores/matchStore.ts

interface MatchStore {

&nbsp; // 状态

&nbsp; currentMatch: Match | null;

&nbsp; matches: Match\[];

&nbsp; loading: boolean;

&nbsp; error: string | null;

&nbsp; 

&nbsp; // Actions

&nbsp; setCurrentMatch: (match: Match) => void;

&nbsp; updateScore: (team: 'A' | 'B', delta: number) => void;

&nbsp; fetchMatches: () => Promise<void>;

&nbsp; createMatch: (data: CreateMatchDTO) => Promise<void>;

}



// stores/bpStore.ts

interface BPStore {

&nbsp; session: BPSession | null;

&nbsp; history: BPAction\[];

&nbsp; 

&nbsp; ban: (team: 'A' | 'B', map: string) => void;

&nbsp; pick: (team: 'A' | 'B', map: string) => void;

&nbsp; undo: () => void;

&nbsp; reset: () => void;

}



// stores/overlayStore.ts

interface OverlayStore {

&nbsp; states: OverlayState;

&nbsp; 

&nbsp; toggle: (name: string, visible: boolean) => void;

&nbsp; setOpacity: (name: string, opacity: number) => void;

&nbsp; switchScene: (sceneId: string) => void;

}



// stores/socketStore.ts

interface SocketStore {

&nbsp; connected: boolean;

&nbsp; socket: Socket | null;

&nbsp; 

&nbsp; connect: () => void;

&nbsp; disconnect: () => void;

&nbsp; emit: (event: string, data: any) => void;

&nbsp; on: (event: string, handler: Function) => void;

}

```



---



\## 实现细节



\### 1. WebSocket实时通信



\#### 服务端实现



```typescript

// server/socket.ts

import { Server } from 'socket.io';

import { Server as HttpServer } from 'http';



export function initializeSocket(httpServer: HttpServer) {

&nbsp; const io = new Server(httpServer, {

&nbsp;   cors: {

&nbsp;     origin: process.env.CORS\_ORIGIN || '\*',

&nbsp;     credentials: true

&nbsp;   },

&nbsp;   pingTimeout: 60000,

&nbsp;   pingInterval: 25000

&nbsp; });



&nbsp; // 连接处理

&nbsp; io.on('connection', (socket) => {

&nbsp;   console.log('Client connected:', socket.id);

&nbsp;   

&nbsp;   // 加入房间

&nbsp;   socket.join('overlay');

&nbsp;   socket.join('admin');

&nbsp;   

&nbsp;   // 比赛控制

&nbsp;   socket.on('match:scoreUpdate', async (data) => {

&nbsp;     try {

&nbsp;       const match = await updateMatchScore(data);

&nbsp;       io.to('overlay').emit('match:update', match);

&nbsp;     } catch (error) {

&nbsp;       socket.emit('system:error', { 

&nbsp;         message: 'Failed to update score' 

&nbsp;       });

&nbsp;     }

&nbsp;   });

&nbsp;   

&nbsp;   // BP控制

&nbsp;   socket.on('bp:ban', async (data) => {

&nbsp;     try {

&nbsp;       const session = await processBan(data);

&nbsp;       io.to('overlay').emit('bp:update', session);

&nbsp;     } catch (error) {

&nbsp;       socket.emit('system:error', { 

&nbsp;         message: 'Failed to ban map' 

&nbsp;       });

&nbsp;     }

&nbsp;   });

&nbsp;   

&nbsp;   // Overlay控制

&nbsp;   socket.on('overlay:toggle', (data) => {

&nbsp;     io.to('overlay').emit('overlay:update', data);

&nbsp;   });

&nbsp;   

&nbsp;   // 断开处理

&nbsp;   socket.on('disconnect', () => {

&nbsp;     console.log('Client disconnected:', socket.id);

&nbsp;   });

&nbsp; });



&nbsp; return io;

}

```



\#### 客户端实现



```typescript

// lib/socket.ts

import { io, Socket } from 'socket.io-client';



class SocketService {

&nbsp; private socket: Socket | null = null;

&nbsp; private reconnectAttempts = 0;

&nbsp; private maxReconnectAttempts = 5;



&nbsp; connect(url: string) {

&nbsp;   this.socket = io(url, {

&nbsp;     reconnection: true,

&nbsp;     reconnectionDelay: 1000,

&nbsp;     reconnectionDelayMax: 5000,

&nbsp;     reconnectionAttempts: this.maxReconnectAttempts

&nbsp;   });



&nbsp;   this.socket.on('connect', () => {

&nbsp;     console.log('Connected to server');

&nbsp;     this.reconnectAttempts = 0;

&nbsp;   });



&nbsp;   this.socket.on('disconnect', () => {

&nbsp;     console.log('Disconnected from server');

&nbsp;   });



&nbsp;   this.socket.on('connect\_error', (error) => {

&nbsp;     this.reconnectAttempts++;

&nbsp;     console.error('Connection error:', error);

&nbsp;     

&nbsp;     if (this.reconnectAttempts >= this.maxReconnectAttempts) {

&nbsp;       console.error('Max reconnection attempts reached');

&nbsp;       // 触发降级方案

&nbsp;       this.handleConnectionFailure();

&nbsp;     }

&nbsp;   });

&nbsp; }



&nbsp; emit(event: string, data: any) {

&nbsp;   this.socket?.emit(event, data);

&nbsp; }



&nbsp; on(event: string, handler: Function) {

&nbsp;   this.socket?.on(event, handler as any);

&nbsp; }



&nbsp; off(event: string, handler?: Function) {

&nbsp;   this.socket?.off(event, handler as any);

&nbsp; }



&nbsp; disconnect() {

&nbsp;   this.socket?.disconnect();

&nbsp; }



&nbsp; private handleConnectionFailure() {

&nbsp;   // 启用本地缓存

&nbsp;   // 显示离线提示

&nbsp;   // 尝试使用备用服务器

&nbsp; }

}



export const socketService = new SocketService();

```



\### 2. Overlay组件实现



\#### 比分板组件



```typescript

// components/overlays/Scoreboard.tsx

'use client';



import { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { socketService } from '@/lib/socket';

import { Match } from '@/types';



export default function Scoreboard() {

&nbsp; const \[match, setMatch] = useState<Match | null>(null);

&nbsp; const \[visible, setVisible] = useState(true);



&nbsp; useEffect(() => {

&nbsp;   // 连接Socket

&nbsp;   socketService.connect(process.env.NEXT\_PUBLIC\_SOCKET\_URL!);



&nbsp;   // 监听比赛更新

&nbsp;   socketService.on('match:update', (data: Match) => {

&nbsp;     setMatch(data);

&nbsp;   });



&nbsp;   // 监听显示控制

&nbsp;   socketService.on('overlay:update', (data: any) => {

&nbsp;     if (data.name === 'scoreboard') {

&nbsp;       setVisible(data.visible);

&nbsp;     }

&nbsp;   });



&nbsp;   return () => {

&nbsp;     socketService.off('match:update');

&nbsp;     socketService.off('overlay:update');

&nbsp;   };

&nbsp; }, \[]);



&nbsp; if (!match) return null;



&nbsp; return (

&nbsp;   <AnimatePresence>

&nbsp;     {visible \&\& (

&nbsp;       <motion.div

&nbsp;         className="fixed top-0 left-1/2 -translate-x-1/2 mt-8"

&nbsp;         initial={{ y: -100, opacity: 0 }}

&nbsp;         animate={{ y: 0, opacity: 1 }}

&nbsp;         exit={{ y: -100, opacity: 0 }}

&nbsp;         transition={{ type: 'spring', damping: 20 }}

&nbsp;       >

&nbsp;         <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-lg px-8 py-4 shadow-2xl border border-gray-700/50">

&nbsp;           <div className="flex items-center gap-8">

&nbsp;             {/\* 队伍A \*/}

&nbsp;             <TeamSection 

&nbsp;               team={match.teamA} 

&nbsp;               score={match.teamA.score}

&nbsp;               side="left"

&nbsp;             />

&nbsp;             

&nbsp;             {/\* 中间信息 \*/}

&nbsp;             <div className="text-center min-w-\[120px]">

&nbsp;               <div className="text-sm text-gray-400 mb-1">

&nbsp;                 {match.currentMap}/{match.format.replace('BO', '')}

&nbsp;               </div>

&nbsp;               <div className="text-2xl font-bold text-white">

&nbsp;                 {match.maps\[match.currentMap - 1]?.name || 'TBD'}

&nbsp;               </div>

&nbsp;             </div>

&nbsp;             

&nbsp;             {/\* 队伍B \*/}

&nbsp;             <TeamSection 

&nbsp;               team={match.teamB} 

&nbsp;               score={match.teamB.score}

&nbsp;               side="right"

&nbsp;             />

&nbsp;           </div>

&nbsp;         </div>

&nbsp;       </motion.div>

&nbsp;     )}

&nbsp;   </AnimatePresence>

&nbsp; );

}



function TeamSection({ team, score, side }: any) {

&nbsp; return (

&nbsp;   <motion.div 

&nbsp;     className={`flex items-center gap-4 ${side === 'right' ? 'flex-row-reverse' : ''}`}

&nbsp;     key={score} // Key变化触发动画

&nbsp;     initial={{ scale: 1 }}

&nbsp;     animate={{ scale: \[1, 1.1, 1] }}

&nbsp;     transition={{ duration: 0.3 }}

&nbsp;   >

&nbsp;     <img 

&nbsp;       src={team.logo} 

&nbsp;       alt={team.name}

&nbsp;       className="w-12 h-12 object-contain"

&nbsp;     />

&nbsp;     <div className={side === 'right' ? 'text-right' : ''}>

&nbsp;       <div className="text-xl font-bold text-white">

&nbsp;         {team.shortName}

&nbsp;       </div>

&nbsp;       <div className="text-sm text-gray-400">

&nbsp;         {team.name}

&nbsp;       </div>

&nbsp;     </div>

&nbsp;     <div className="text-4xl font-bold text-white min-w-\[60px] text-center">

&nbsp;       {score}

&nbsp;     </div>

&nbsp;   </motion.div>

&nbsp; );

}

```



\#### BP系统组件



```typescript

// components/overlays/BP.tsx

'use client';



import { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { socketService } from '@/lib/socket';

import { BPSession, BPAction } from '@/types';



const MAP\_POOL = \[

&nbsp; { name: 'Dust2', image: '/maps/dust2.jpg' },

&nbsp; { name: 'Mirage', image: '/maps/mirage.jpg' },

&nbsp; { name: 'Inferno', image: '/maps/inferno.jpg' },

&nbsp; { name: 'Nuke', image: '/maps/nuke.jpg' },

&nbsp; { name: 'Overpass', image: '/maps/overpass.jpg' },

&nbsp; { name: 'Vertigo', image: '/maps/vertigo.jpg' },

&nbsp; { name: 'Ancient', image: '/maps/ancient.jpg' },

];



export default function BP() {

&nbsp; const \[session, setSession] = useState<BPSession | null>(null);

&nbsp; const \[visible, setVisible] = useState(false);



&nbsp; useEffect(() => {

&nbsp;   socketService.on('bp:update', (data: BPSession) => {

&nbsp;     setSession(data);

&nbsp;   });



&nbsp;   socketService.on('overlay:update', (data: any) => {

&nbsp;     if (data.name === 'bp') {

&nbsp;       setVisible(data.visible);

&nbsp;     }

&nbsp;   });



&nbsp;   return () => {

&nbsp;     socketService.off('bp:update');

&nbsp;     socketService.off('overlay:update');

&nbsp;   };

&nbsp; }, \[]);



&nbsp; if (!visible || !session) return null;



&nbsp; const getMapStatus = (mapName: string) => {

&nbsp;   const action = session.actions.find(a => a.map === mapName);

&nbsp;   return action || null;

&nbsp; };



&nbsp; return (

&nbsp;   <motion.div

&nbsp;     className="fixed inset-0 flex items-center justify-center"

&nbsp;     initial={{ opacity: 0 }}

&nbsp;     animate={{ opacity: 1 }}

&nbsp;     exit={{ opacity: 0 }}

&nbsp;   >

&nbsp;     <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-12 shadow-2xl">

&nbsp;       <h2 className="text-4xl font-bold text-white text-center mb-8">

&nbsp;         Map Veto

&nbsp;       </h2>

&nbsp;       

&nbsp;       <div className="grid grid-cols-4 gap-6">

&nbsp;         {MAP\_POOL.map((map, index) => {

&nbsp;           const status = getMapStatus(map.name);

&nbsp;           return (

&nbsp;             <MapCard 

&nbsp;               key={map.name}

&nbsp;               map={map}

&nbsp;               status={status}

&nbsp;               index={index}

&nbsp;             />

&nbsp;           );

&nbsp;         })}

&nbsp;       </div>



&nbsp;       {/\* 当前操作提示 \*/}

&nbsp;       <motion.div 

&nbsp;         className="mt-8 text-center"

&nbsp;         key={session.activeTeam + session.currentPhase}

&nbsp;         initial={{ y: 20, opacity: 0 }}

&nbsp;         animate={{ y: 0, opacity: 1 }}

&nbsp;       >

&nbsp;         <div className="text-2xl text-white">

&nbsp;           Team {session.activeTeam} - {session.currentPhase.toUpperCase()}

&nbsp;         </div>

&nbsp;         {session.countdown > 0 \&\& (

&nbsp;           <div className="text-5xl font-bold text-orange-500 mt-2">

&nbsp;             {session.countdown}s

&nbsp;           </div>

&nbsp;         )}

&nbsp;       </motion.div>

&nbsp;     </div>

&nbsp;   </motion.div>

&nbsp; );

}



function MapCard({ map, status, index }: any) {

&nbsp; const isBanned = status?.type === 'ban';

&nbsp; const isPicked = status?.type === 'pick';



&nbsp; return (

&nbsp;   <motion.div

&nbsp;     className="relative overflow-hidden rounded-lg aspect-video"

&nbsp;     initial={{ opacity: 0, y: 50 }}

&nbsp;     animate={{ opacity: 1, y: 0 }}

&nbsp;     transition={{ delay: index \* 0.1 }}

&nbsp;   >

&nbsp;     <img 

&nbsp;       src={map.image} 

&nbsp;       alt={map.name}

&nbsp;       className={`w-full h-full object-cover transition-all ${

&nbsp;         isBanned ? 'grayscale brightness-50' : ''

&nbsp;       }`}

&nbsp;     />

&nbsp;     

&nbsp;     {/\* 地图名称 \*/}

&nbsp;     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">

&nbsp;       <div className="text-xl font-bold text-white">

&nbsp;         {map.name}

&nbsp;       </div>

&nbsp;     </div>



&nbsp;     {/\* Ban/Pick标记 \*/}

&nbsp;     <AnimatePresence>

&nbsp;       {status \&\& (

&nbsp;         <motion.div

&nbsp;           className={`absolute inset-0 flex items-center justify-center ${

&nbsp;             isBanned ? 'bg-red-500/80' : 'bg-green-500/80'

&nbsp;           }`}

&nbsp;           initial={{ scale: 0 }}

&nbsp;           animate={{ scale: 1 }}

&nbsp;           exit={{ scale: 0 }}

&nbsp;         >

&nbsp;           <div className="text-6xl font-bold text-white">

&nbsp;             {isBanned ? 'BANNED' : 'PICKED'}

&nbsp;           </div>

&nbsp;           <div className="absolute bottom-4 text-2xl text-white">

&nbsp;             Team {status.team}

&nbsp;           </div>

&nbsp;         </motion.div>

&nbsp;       )}

&nbsp;     </AnimatePresence>

&nbsp;   </motion.div>

&nbsp; );

}

```



\### 3. 控制面板实现



\#### 比赛控制组件



```typescript

// app/admin/match-control/page.tsx

'use client';



import { useState } from 'react';

import { socketService } from '@/lib/socket';

import { Match } from '@/types';



export default function MatchControl() {

&nbsp; const \[match, setMatch] = useState<Match | null>(null);



&nbsp; const updateScore = (team: 'A' | 'B', delta: number) => {

&nbsp;   socketService.emit('match:scoreUpdate', { team, delta });

&nbsp; };



&nbsp; const resetMatch = () => {

&nbsp;   if (confirm('确定要重置比赛吗？')) {

&nbsp;     socketService.emit('match:reset', { matchId: match?.id });

&nbsp;   }

&nbsp; };



&nbsp; return (

&nbsp;   <div className="p-8">

&nbsp;     <h1 className="text-3xl font-bold mb-8">比赛控制</h1>

&nbsp;     

&nbsp;     {/\* 比分控制 \*/}

&nbsp;     <div className="grid grid-cols-2 gap-8 mb-8">

&nbsp;       <ScoreControl 

&nbsp;         team={match?.teamA}

&nbsp;         side="A"

&nbsp;         onUpdate={updateScore}

&nbsp;       />

&nbsp;       <ScoreControl 

&nbsp;         team={match?.teamB}

&nbsp;         side="B"

&nbsp;         onUpdate={updateScore}

&nbsp;       />

&nbsp;     </div>



&nbsp;     {/\* 地图控制 \*/}

&nbsp;     <div className="bg-white rounded-lg p-6 shadow mb-8">

&nbsp;       <h2 className="text-xl font-bold mb-4">地图控制</h2>

&nbsp;       <div className="grid grid-cols-7 gap-4">

&nbsp;         {MAP\_POOL.map(map => (

&nbsp;           <button

&nbsp;             key={map.name}

&nbsp;             onClick={() => selectMap(map.name)}

&nbsp;             className="p-4 border rounded hover:bg-gray-50"

&nbsp;           >

&nbsp;             <img src={map.image} className="w-full mb-2" />

&nbsp;             <div className="text-sm">{map.name}</div>

&nbsp;           </button>

&nbsp;         ))}

&nbsp;       </div>

&nbsp;     </div>



&nbsp;     {/\* 快捷操作 \*/}

&nbsp;     <div className="flex gap-4">

&nbsp;       <button

&nbsp;         onClick={resetMatch}

&nbsp;         className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"

&nbsp;       >

&nbsp;         重置比赛

&nbsp;       </button>

&nbsp;       <button

&nbsp;         onClick={() => socketService.emit('match:pause')}

&nbsp;         className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"

&nbsp;       >

&nbsp;         暂停

&nbsp;       </button>

&nbsp;     </div>

&nbsp;   </div>

&nbsp; );

}



function ScoreControl({ team, side, onUpdate }: any) {

&nbsp; return (

&nbsp;   <div className="bg-white rounded-lg p-6 shadow">

&nbsp;     <div className="flex items-center gap-4 mb-4">

&nbsp;       <img src={team?.logo} className="w-16 h-16" />

&nbsp;       <div>

&nbsp;         <div className="text-2xl font-bold">{team?.name}</div>

&nbsp;         <div className="text-gray-500">{team?.shortName}</div>

&nbsp;       </div>

&nbsp;     </div>

&nbsp;     

&nbsp;     <div className="flex items-center gap-4">

&nbsp;       <button

&nbsp;         onClick={() => onUpdate(side, -1)}

&nbsp;         className="px-6 py-3 bg-red-500 text-white rounded text-2xl font-bold hover:bg-red-600"

&nbsp;       >

&nbsp;         -1

&nbsp;       </button>

&nbsp;       

&nbsp;       <div className="text-6xl font-bold flex-1 text-center">

&nbsp;         {team?.score || 0}

&nbsp;       </div>

&nbsp;       

&nbsp;       <button

&nbsp;         onClick={() => onUpdate(side, 1)}

&nbsp;         className="px-6 py-3 bg-green-500 text-white rounded text-2xl font-bold hover:bg-green-600"

&nbsp;       >

&nbsp;         +1

&nbsp;       </button>

&nbsp;     </div>

&nbsp;   </div>

&nbsp; );

}

```



\### 4. 数据持久化



\#### Prisma Schema



```prisma

// prisma/schema.prisma

generator client {

&nbsp; provider = "prisma-client-js"

}



datasource db {

&nbsp; provider = "postgresql"

&nbsp; url      = env("DATABASE\_URL")

}



model Event {

&nbsp; id        String   @id @default(cuid())

&nbsp; name      String

&nbsp; logo      String?

&nbsp; startDate DateTime

&nbsp; endDate   DateTime

&nbsp; format    String

&nbsp; createdAt DateTime @default(now())

&nbsp; updatedAt DateTime @updatedAt

&nbsp; 

&nbsp; matches   Match\[]

&nbsp; sponsors  Sponsor\[]

}



model Team {

&nbsp; id         String   @id @default(cuid())

&nbsp; name       String

&nbsp; shortName  String

&nbsp; logo       String?

&nbsp; country    String

&nbsp; createdAt  DateTime @default(now())

&nbsp; updatedAt  DateTime @updatedAt

&nbsp; 

&nbsp; players    Player\[]

&nbsp; matchesA   Match\[]  @relation("TeamA")

&nbsp; matchesB   Match\[]  @relation("TeamB")

}



model Player {

&nbsp; id        String   @id @default(cuid())

&nbsp; gameId    String   @unique

&nbsp; realName  String

&nbsp; country   String

&nbsp; avatar    String?

&nbsp; teamId    String

&nbsp; createdAt DateTime @default(now())

&nbsp; updatedAt DateTime @updatedAt

&nbsp; 

&nbsp; team      Team     @relation(fields: \[teamId], references: \[id])

}



model Match {

&nbsp; id          String      @id @default(cuid())

&nbsp; eventId     String

&nbsp; teamAId     String

&nbsp; teamBId     String

&nbsp; format      String

&nbsp; currentMap  Int         @default(1)

&nbsp; status      String      @default("upcoming")

&nbsp; startTime   DateTime

&nbsp; endTime     DateTime?

&nbsp; createdAt   DateTime    @default(now())

&nbsp; updatedAt   DateTime    @updatedAt

&nbsp; 

&nbsp; event       Event       @relation(fields: \[eventId], references: \[id])

&nbsp; teamA       Team        @relation("TeamA", fields: \[teamAId], references: \[id])

&nbsp; teamB       Team        @relation("TeamB", fields: \[teamBId], references: \[id])

&nbsp; maps        Map\[]

&nbsp; bpSessions  BPSession\[]

}



model Map {

&nbsp; id        String   @id @default(cuid())

&nbsp; matchId   String

&nbsp; name      String

&nbsp; order     Int

&nbsp; scoreA    Int      @default(0)

&nbsp; scoreB    Int      @default(0)

&nbsp; status    String   @default("upcoming")

&nbsp; winner    String?

&nbsp; createdAt DateTime @default(now())

&nbsp; updatedAt DateTime @updatedAt

&nbsp; 

&nbsp; match     Match    @relation(fields: \[matchId], references: \[id])

&nbsp; rounds    Round\[]

}



model Round {

&nbsp; id          String   @id @default(cuid())

&nbsp; mapId       String

&nbsp; roundNumber Int

&nbsp; winner      String

&nbsp; reason      String

&nbsp; mvp         String?

&nbsp; createdAt   DateTime @default(now())

&nbsp; 

&nbsp; map         Map      @relation(fields: \[mapId], references: \[id])

}



model BPSession {

&nbsp; id           String     @id @default(cuid())

&nbsp; matchId      String

&nbsp; mapPool      String\[]

&nbsp; currentPhase String     @default("ban")

&nbsp; activeTeam   String     @default("A")

&nbsp; countdown    Int        @default(0)

&nbsp; status       String     @default("active")

&nbsp; createdAt    DateTime   @default(now())

&nbsp; updatedAt    DateTime   @updatedAt

&nbsp; 

&nbsp; match        Match      @relation(fields: \[matchId], references: \[id])

&nbsp; actions      BPAction\[]

}



model BPAction {

&nbsp; id        String   @id @default(cuid())

&nbsp; sessionId String

&nbsp; type      String

&nbsp; team      String

&nbsp; map       String

&nbsp; order     Int

&nbsp; createdAt DateTime @default(now())

&nbsp; 

&nbsp; session   BPSession @relation(fields: \[sessionId], references: \[id])

}



model Sponsor {

&nbsp; id              String  @id @default(cuid())

&nbsp; eventId         String

&nbsp; name            String

&nbsp; logo            String

&nbsp; tier            String

&nbsp; displayDuration Int     @default(5)

&nbsp; 

&nbsp; event           Event   @relation(fields: \[eventId], references: \[id])

}

```



\### 5. 错误处理与降级方案



\#### 断线重连



```typescript

// lib/reconnection.ts

import { socketService } from './socket';



class ReconnectionManager {

&nbsp; private reconnectAttempts = 0;

&nbsp; private maxAttempts = 5;

&nbsp; private backupData: any = null;



&nbsp; async handleDisconnection() {

&nbsp;   // 保存当前状态到本地

&nbsp;   this.saveToLocalStorage();

&nbsp;   

&nbsp;   // 尝试重连

&nbsp;   while (this.reconnectAttempts < this.maxAttempts) {

&nbsp;     await this.sleep(this.getBackoffDelay());

&nbsp;     

&nbsp;     try {

&nbsp;       await socketService.connect(process.env.NEXT\_PUBLIC\_SOCKET\_URL!);

&nbsp;       this.reconnectAttempts = 0;

&nbsp;       this.restoreFromLocalStorage();

&nbsp;       return true;

&nbsp;     } catch (error) {

&nbsp;       this.reconnectAttempts++;

&nbsp;     }

&nbsp;   }

&nbsp;   

&nbsp;   // 连接失败，启用离线模式

&nbsp;   this.enableOfflineMode();

&nbsp;   return false;

&nbsp; }



&nbsp; private getBackoffDelay() {

&nbsp;   // 指数退避算法

&nbsp;   return Math.min(1000 \* Math.pow(2, this.reconnectAttempts), 30000);

&nbsp; }



&nbsp; private saveToLocalStorage() {

&nbsp;   const state = {

&nbsp;     match: store.getState().match,

&nbsp;     bp: store.getState().bp,

&nbsp;     timestamp: Date.now()

&nbsp;   };

&nbsp;   localStorage.setItem('backup-state', JSON.stringify(state));

&nbsp; }



&nbsp; private restoreFromLocalStorage() {

&nbsp;   const backup = localStorage.getItem('backup-state');

&nbsp;   if (backup) {

&nbsp;     const state = JSON.parse(backup);

&nbsp;     // 检查数据是否过期（5分钟）

&nbsp;     if (Date.now() - state.timestamp < 5 \* 60 \* 1000) {

&nbsp;       store.setState(state);

&nbsp;     }

&nbsp;   }

&nbsp; }



&nbsp; private enableOfflineMode() {

&nbsp;   // 显示离线提示

&nbsp;   toast.error('服务器连接失败，已进入离线模式');

&nbsp;   

&nbsp;   // 禁用实时功能

&nbsp;   store.setState({ offlineMode: true });

&nbsp; }



&nbsp; private sleep(ms: number) {

&nbsp;   return new Promise(resolve => setTimeout(resolve, ms));

&nbsp; }

}



export const reconnectionManager = new ReconnectionManager();

```



\#### 数据校验



```typescript

// lib/validation.ts

import { z } from 'zod';



// Match数据校验

export const MatchSchema = z.object({

&nbsp; id: z.string(),

&nbsp; teamA: z.object({

&nbsp;   id: z.string(),

&nbsp;   name: z.string(),

&nbsp;   score: z.number().min(0)

&nbsp; }),

&nbsp; teamB: z.object({

&nbsp;   id: z.string(),

&nbsp;   name: z.string(),

&nbsp;   score: z.number().min(0)

&nbsp; }),

&nbsp; format: z.enum(\['BO1', 'BO3', 'BO5']),

&nbsp; currentMap: z.number().min(1),

&nbsp; status: z.enum(\['upcoming', 'live', 'finished'])

});



// BP数据校验

export const BPSessionSchema = z.object({

&nbsp; id: z.string(),

&nbsp; matchId: z.string(),

&nbsp; mapPool: z.array(z.string()).length(7),

&nbsp; actions: z.array(z.object({

&nbsp;   type: z.enum(\['ban', 'pick']),

&nbsp;   team: z.enum(\['A', 'B']),

&nbsp;   map: z.string()

&nbsp; })),

&nbsp; currentPhase: z.enum(\['ban', 'pick']),

&nbsp; activeTeam: z.enum(\['A', 'B'])

});



// 数据校验中间件

export function validateData<T>(schema: z.ZodSchema<T>, data: any): T {

&nbsp; try {

&nbsp;   return schema.parse(data);

&nbsp; } catch (error) {

&nbsp;   console.error('Data validation failed:', error);

&nbsp;   throw new Error('Invalid data format');

&nbsp; }

}

```



---



\## 部署指南



\### Docker部署



\#### Dockerfile



```dockerfile

\# Frontend Dockerfile

FROM node:18-alpine AS base



\# Dependencies

FROM base AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci



\# Builder

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node\_modules ./node\_modules

COPY . .

RUN npm run build



\# Runner

FROM base AS runner

WORKDIR /app

ENV NODE\_ENV production



RUN addgroup --system --gid 1001 nodejs

RUN adduser --system --uid 1001 nextjs



COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static



USER nextjs



EXPOSE 3000

ENV PORT 3000



CMD \["node", "server.js"]

```



```dockerfile

\# Backend Dockerfile

FROM node:18-alpine



WORKDIR /app



COPY package\*.json ./

RUN npm ci --only=production



COPY . .

RUN npm run build



EXPOSE 3001



CMD \["node", "dist/index.js"]

```



\#### Docker Compose



```yaml

\# docker-compose.yml

version: '3.8'



services:

&nbsp; frontend:

&nbsp;   build:

&nbsp;     context: ./frontend

&nbsp;     dockerfile: Dockerfile

&nbsp;   ports:

&nbsp;     - "3000:3000"

&nbsp;   environment:

&nbsp;     - NEXT\_PUBLIC\_SOCKET\_URL=http://backend:3001

&nbsp;   depends\_on:

&nbsp;     - backend

&nbsp;   networks:

&nbsp;     - app-network



&nbsp; backend:

&nbsp;   build:

&nbsp;     context: ./backend

&nbsp;     dockerfile: Dockerfile

&nbsp;   ports:

&nbsp;     - "3001:3001"

&nbsp;   environment:

&nbsp;     - DATABASE\_URL=postgresql://user:password@postgres:5432/cs2overlay

&nbsp;     - REDIS\_URL=redis://redis:6379

&nbsp;   depends\_on:

&nbsp;     - postgres

&nbsp;     - redis

&nbsp;   networks:

&nbsp;     - app-network



&nbsp; postgres:

&nbsp;   image: postgres:15-alpine

&nbsp;   environment:

&nbsp;     - POSTGRES\_USER=user

&nbsp;     - POSTGRES\_PASSWORD=password

&nbsp;     - POSTGRES\_DB=cs2overlay

&nbsp;   volumes:

&nbsp;     - postgres-data:/var/lib/postgresql/data

&nbsp;   networks:

&nbsp;     - app-network



&nbsp; redis:

&nbsp;   image: redis:7-alpine

&nbsp;   volumes:

&nbsp;     - redis-data:/data

&nbsp;   networks:

&nbsp;     - app-network



&nbsp; nginx:

&nbsp;   image: nginx:alpine

&nbsp;   ports:

&nbsp;     - "80:80"

&nbsp;     - "443:443"

&nbsp;   volumes:

&nbsp;     - ./nginx.conf:/etc/nginx/nginx.conf:ro

&nbsp;     - ./ssl:/etc/nginx/ssl:ro

&nbsp;   depends\_on:

&nbsp;     - frontend

&nbsp;     - backend

&nbsp;   networks:

&nbsp;     - app-network



networks:

&nbsp; app-network:

&nbsp;   driver: bridge



volumes:

&nbsp; postgres-data:

&nbsp; redis-data:

```



\### Nginx配置



```nginx

\# nginx.conf

upstream frontend {

&nbsp; server frontend:3000;

}



upstream backend {

&nbsp; server backend:3001;

}



server {

&nbsp; listen 80;

&nbsp; server\_name your-domain.com;

&nbsp; return 301 https://$server\_name$request\_uri;

}



server {

&nbsp; listen 443 ssl http2;

&nbsp; server\_name your-domain.com;



&nbsp; ssl\_certificate /etc/nginx/ssl/cert.pem;

&nbsp; ssl\_certificate\_key /etc/nginx/ssl/key.pem;



&nbsp; # Frontend

&nbsp; location / {

&nbsp;   proxy\_pass http://frontend;

&nbsp;   proxy\_http\_version 1.1;

&nbsp;   proxy\_set\_header Upgrade $http\_upgrade;

&nbsp;   proxy\_set\_header Connection 'upgrade';

&nbsp;   proxy\_set\_header Host $host;

&nbsp;   proxy\_cache\_bypass $http\_upgrade;

&nbsp; }



&nbsp; # Backend API

&nbsp; location /api {

&nbsp;   proxy\_pass http://backend;

&nbsp;   proxy\_http\_version 1.1;

&nbsp;   proxy\_set\_header X-Real-IP $remote\_addr;

&nbsp;   proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;

&nbsp;   proxy\_set\_header Host $host;

&nbsp; }



&nbsp; # WebSocket

&nbsp; location /socket.io {

&nbsp;   proxy\_pass http://backend;

&nbsp;   proxy\_http\_version 1.1;

&nbsp;   proxy\_set\_header Upgrade $http\_upgrade;

&nbsp;   proxy\_set\_header Connection "upgrade";

&nbsp;   proxy\_set\_header Host $host;

&nbsp;   proxy\_set\_header X-Real-IP $remote\_addr;

&nbsp;   proxy\_set\_header X-Forwarded-For $proxy\_add\_x\_forwarded\_for;

&nbsp; }

}

```



\### 部署步骤



```bash

\# 1. 克隆项目

git clone https://github.com/your-repo/cs2-overlay.git

cd cs2-overlay



\# 2. 配置环境变量

cp .env.example .env

\# 编辑.env文件



\# 3. 构建并启动

docker-compose up -d



\# 4. 检查状态

docker-compose ps



\# 5. 查看日志

docker-compose logs -f



\# 6. 数据库迁移

docker-compose exec backend npm run prisma:migrate



\# 7. 创建管理员账户（如有）

docker-compose exec backend npm run seed

```



\### 性能优化



\#### 前端优化



```typescript

// next.config.js

module.exports = {

&nbsp; compress: true,

&nbsp; images: {

&nbsp;   formats: \['image/webp'],

&nbsp;   deviceSizes: \[640, 750, 828, 1080, 1200, 1920],

&nbsp; },

&nbsp; swcMinify: true,

&nbsp; compiler: {

&nbsp;   removeConsole: process.env.NODE\_ENV === 'production',

&nbsp; },

};

```



\#### 缓存策略



```typescript

// 使用React Query缓存

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const queryClient = new QueryClient({

&nbsp; defaultOptions: {

&nbsp;   queries: {

&nbsp;     staleTime: 5 \* 60 \* 1000, // 5分钟

&nbsp;     cacheTime: 10 \* 60 \* 1000, // 10分钟

&nbsp;     refetchOnWindowFocus: false,

&nbsp;   },

&nbsp; },

});

```



---



\## 使用手册



\### OBS配置指南



\#### 1. 添加浏览器源



1\. 在OBS中右键点击场景

2\. 选择"添加" → "浏览器"

3\. 配置参数：

&nbsp;  - \*\*URL\*\*: `http://localhost:3000/overlay/scoreboard`

&nbsp;  - \*\*宽度\*\*: 1920

&nbsp;  - \*\*高度\*\*: 1080

&nbsp;  - \*\*FPS\*\*: 60

&nbsp;  - \*\*勾选\*\*: "当源不可见时关闭源"

&nbsp;  - \*\*自定义CSS\*\*: 

&nbsp;    ```css

&nbsp;    body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }

&nbsp;    ```



\#### 2. 推荐场景配置



\*\*开场场景\*\*:

\- 游戏画面

\- 比分板 (Scoreboard)

\- 顶部信息栏 (Top Bar)



\*\*BP场景\*\*:

\- BP界面 (BP)

\- 背景音乐



\*\*比赛中场景\*\*:

\- 游戏画面

\- 比分板

\- 选手摄像头 + 边框



\*\*中场休息\*\*:

\- 休息画面 (Break)

\- 赞助商展示



\#### 3. 快捷键设置



建议设置以下快捷键：

\- F1: 显示/隐藏比分板

\- F2: 显示/隐藏BP

\- F3: 显示/隐藏选手信息

\- F4: 切换到比赛场景

\- F5: 切换到中场场景



\### 控制面板使用



\#### 比赛前准备



1\. \*\*创建比赛\*\*

&nbsp;  - 进入 `/admin/dashboard`

&nbsp;  - 点击"新建比赛"

&nbsp;  - 填写比赛信息（队伍、赛制等）

&nbsp;  - 保存



2\. \*\*配置队伍信息\*\*

&nbsp;  - 上传队伍Logo

&nbsp;  - 设置队名和缩写

&nbsp;  - 添加选手名单



3\. \*\*设置BP流程\*\*

&nbsp;  - 选择赛制（BO1/BO3/BO5）

&nbsp;  - 加载对应BP流程预设



\#### 比赛中操作



1\. \*\*控制比分\*\*

&nbsp;  - 使用 +1/-1 按钮调整比分

&nbsp;  - 或直接输入分数



2\. \*\*BP操作\*\*

&nbsp;  - 点击地图进行Ban/Pick

&nbsp;  - 系统自动切换队伍和阶段

&nbsp;  - 可撤销上一步操作



3\. \*\*Overlay控制\*\*

&nbsp;  - 使用开关控制显示/隐藏

&nbsp;  - 切换预设场景



\### 常见问题



\#### Q: Overlay不显示？

A: 检查：

1\. URL是否正确

2\. 服务是否运行

3\. WebSocket是否连接

4\. 浏览器控制台是否有错误



\#### Q: 动画卡顿？

A: 尝试：

1\. 降低OBS的FPS设置

2\. 减少同时显示的overlay数量

3\. 检查CPU占用



\#### Q: WebSocket频繁断开？

A: 检查：

1\. 网络连接

2\. 防火墙设置

3\. 服务器负载

4\. Nginx配置



---



\## 附录



\### A. 技术栈完整清单



\#### 前端依赖



```json

{

&nbsp; "dependencies": {

&nbsp;   "next": "14.0.0",

&nbsp;   "react": "18.2.0",

&nbsp;   "react-dom": "18.2.0",

&nbsp;   "typescript": "5.2.0",

&nbsp;   "framer-motion": "10.16.0",

&nbsp;   "socket.io-client": "4.6.0",

&nbsp;   "zustand": "4.4.0",

&nbsp;   "@tanstack/react-query": "5.0.0",

&nbsp;   "tailwindcss": "3.3.0",

&nbsp;   "zod": "3.22.0",

&nbsp;   "date-fns": "2.30.0",

&nbsp;   "recharts": "2.9.0",

&nbsp;   "lucide-react": "0.292.0"

&nbsp; },

&nbsp; "devDependencies": {

&nbsp;   "@types/node": "20.8.0",

&nbsp;   "@types/react": "18.2.0",

&nbsp;   "eslint": "8.51.0",

&nbsp;   "prettier": "3.0.0"

&nbsp; }

}

```



\#### 后端依赖



```json

{

&nbsp; "dependencies": {

&nbsp;   "express": "4.18.2",

&nbsp;   "socket.io": "4.6.0",

&nbsp;   "prisma": "5.5.0",

&nbsp;   "@prisma/client": "5.5.0",

&nbsp;   "cors": "2.8.5",

&nbsp;   "dotenv": "16.3.1",

&nbsp;   "zod": "3.22.0",

&nbsp;   "bcrypt": "5.1.1",

&nbsp;   "jsonwebtoken": "9.0.2",

&nbsp;   "helmet": "7.1.0",

&nbsp;   "rate-limiter-flexible": "3.0.0"

&nbsp; },

&nbsp; "devDependencies": {

&nbsp;   "@types/express": "4.17.20",

&nbsp;   "@types/cors": "2.8.15",

&nbsp;   "nodemon": "3.0.1",

&nbsp;   "ts-node": "10.9.1"

&nbsp; }

}

```



\### B. Git工作流



\#### 分支策略



```

main          - 生产环境

&nbsp; └─ develop  - 开发环境

&nbsp;     ├─ feature/scoreboard

&nbsp;     ├─ feature/bp-system

&nbsp;     └─ feature/admin-panel

```



\#### Commit规范



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



\### C. 测试清单



\#### 功能测试



\- \[ ] 比分板显示正确

\- \[ ] 比分更新实时同步

\- \[ ] BP流程完整可用

\- \[ ] 所有overlay可切换

\- \[ ] 控制面板功能正常

\- \[ ] 数据持久化正常



\#### 性能测试



\- \[ ] Overlay渲染60fps

\- \[ ] WebSocket延迟<100ms

\- \[ ] 内存占用稳定

\- \[ ] 长时间运行无泄漏



\#### 兼容性测试



\- \[ ] OBS 28+ 兼容

\- \[ ] Chrome/Edge浏览器

\- \[ ] 1920x1080分辨率

\- \[ ] Windows/Mac/Linux



\### D. 资源链接



\- \*\*OBS官网\*\*: https://obsproject.com/

\- \*\*Socket.io文档\*\*: https://socket.io/docs/

\- \*\*Framer Motion\*\*: https://www.framer.com/motion/

\- \*\*Next.js文档\*\*: https://nextjs.org/docs

\- \*\*Prisma文档\*\*: https://www.prisma.io/docs



\### E. 团队协作



\#### 角色分工



\- \*\*前端开发\*\*: Overlay组件、控制面板

\- \*\*后端开发\*\*: API、WebSocket、数据库

\- \*\*UI/UX设计\*\*: 界面设计、动画效果

\- \*\*测试\*\*: 功能测试、性能测试

\- \*\*运维\*\*: 部署、监控、维护



\#### 沟通渠道



\- 日会: 每日同步进度

\- 周会: 回顾与规划

\- 文档: Notion/飞书

\- 代码: GitHub PR Review



---



\## 结语



本文档提供了CS2赛事直播Overlay系统的完整开发指南。建议按照开发计划循序渐进，先完成MVP，再逐步添加功能。



在开发过程中：

1\. 保持代码整洁和文档更新

2\. 及时测试和修复问题

3\. 注重用户体验和性能

4\. 做好错误处理和降级方案



祝开发顺利！🚀



---



\*\*版本\*\*: v1.0

\*\*最后更新\*\*: 2025-01-29

\*\*许可\*\*: MIT License

