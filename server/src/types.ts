// ============================================
// Core Types
// ============================================

export type TeamSide = 'A' | 'B';
export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type MatchFormat = 'BO1' | 'BO3' | 'BO5';
export type BPPhase = 'ban' | 'pick';
export type BPStatus = 'active' | 'completed';
export type OverlayName =
  | 'scoreboard'
  | 'bp'
  | 'lowerThird'
  | 'topBar'
  | 'mapVeto'
  | 'countdown'
  | 'replay'
  | 'break'
  | 'sponsor'
  | 'playerCam';

// ============================================
// Data Models
// ============================================

export interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  rating: number;
}

export interface Player {
  id: string;
  gameId: string;
  realName: string;
  country: string;
  avatar?: string;
  teamId: string;
  stats?: PlayerStats;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  players: Player[];
  score: number;
  economy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameMap {
  id: string;
  matchId: string;
  name: string;
  order: number;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  rounds: Round[];
  winner?: TeamSide;
  createdAt: string;
  updatedAt: string;
}

export interface Round {
  id: string;
  mapId: string;
  roundNumber: number;
  winner: TeamSide;
  reason: 'elimination' | 'bomb' | 'time' | 'defuse';
  mvp?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  eventId: string;
  teamA: Team;
  teamB: Team;
  format: MatchFormat;
  currentMap: number;
  maps: GameMap[];
  status: MatchStatus;
  startTime: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BPAction {
  id: string;
  sessionId: string;
  type: BPPhase;
  team: TeamSide;
  map: string;
  order: number;
  timestamp: string;
}

export interface BPSession {
  id: string;
  matchId: string;
  format: MatchFormat;
  mapPool: string[];
  actions: BPAction[];
  currentPhase: BPPhase;
  activeTeam: TeamSide;
  countdown: number;
  status: BPStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OverlayComponentState {
  visible: boolean;
  opacity: number;
}

export interface OverlayState {
  scoreboard: OverlayComponentState;
  bp: OverlayComponentState;
  lowerThird: OverlayComponentState;
  topBar: OverlayComponentState;
  mapVeto: OverlayComponentState;
  countdown: OverlayComponentState;
  replay: OverlayComponentState;
  break: OverlayComponentState;
  sponsor: OverlayComponentState;
  playerCam: OverlayComponentState;
}

// ============================================
// Client → Server Payloads
// ============================================

export interface MatchInitPayload {
  teamAName: string;
  teamAShortName: string;
  teamBName: string;
  teamBShortName: string;
  format: MatchFormat;
}

export interface ScoreUpdatePayload {
  team: TeamSide;
  delta: number;
}

export interface RoundUpdatePayload {
  mapId: string;
  winner: TeamSide;
}

export interface StatusChangePayload {
  status: MatchStatus;
}

export interface BPInitPayload {
  format: MatchFormat;
}

export interface BPActionPayload {
  map: string;
}

export interface BPBanPayload {
  team: TeamSide;
  map: string;
}

export interface BPPickPayload {
  team: TeamSide;
  map: string;
}

export interface BPUndoPayload {
  actionId: string;
}

export interface BPResetPayload {
  sessionId: string;
}

export interface OverlayTogglePayload {
  name: OverlayName;
  visible: boolean;
}

export interface OverlaySetOpacityPayload {
  name: OverlayName;
  opacity: number;
}

export interface OverlayApplyScenePayload {
  overlays: Record<OverlayName, boolean>;
}

export interface OverlayScenePayload {
  sceneId: string;
}

// ============================================
// Server → Client Payloads
// ============================================

export interface SystemErrorPayload {
  code: string;
  message: string;
}

export interface SystemNotificationPayload {
  type: 'info' | 'warning' | 'success';
  message: string;
}

// ============================================
// WebSocket Event Maps
// ============================================

export interface ClientToServerEvents {
  'match:init': (payload: MatchInitPayload) => void;
  'match:scoreUpdate': (payload: ScoreUpdatePayload) => void;
  'match:roundUpdate': (payload: RoundUpdatePayload) => void;
  'match:statusChange': (payload: StatusChangePayload) => void;
  'match:reset': () => void;
  'bp:init': (payload: BPInitPayload) => void;
  'bp:action': (payload: BPActionPayload) => void;
  'bp:ban': (payload: BPBanPayload) => void;
  'bp:pick': (payload: BPPickPayload) => void;
  'bp:undo': (payload: BPUndoPayload) => void;
  'bp:reset': (payload: BPResetPayload) => void;
  'overlay:toggle': (payload: OverlayTogglePayload) => void;
  'overlay:setOpacity': (payload: OverlaySetOpacityPayload) => void;
  'overlay:applyScene': (payload: OverlayApplyScenePayload) => void;
  'overlay:scene': (payload: OverlayScenePayload) => void;
  'state:requestSync': () => void;
}

export interface ServerToClientEvents {
  'match:update': (payload: Match) => void;
  'match:cleared': () => void;
  'bp:update': (payload: BPSession) => void;
  'bp:cleared': () => void;
  'overlay:update': (payload: OverlayState) => void;
  'player:statsUpdate': (payload: PlayerStats[]) => void;
  'system:error': (payload: SystemErrorPayload) => void;
  'system:notification': (payload: SystemNotificationPayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  role: 'overlay' | 'admin';
}
