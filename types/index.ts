// ============================================
// Core Data Models
// ============================================

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

export type MatchFormat = 'BO1' | 'BO3' | 'BO5';
export type MatchStatus = 'upcoming' | 'live' | 'finished';

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

export interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  rating: number;
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

export type TeamSide = 'A' | 'B';

export interface Round {
  id: string;
  mapId: string;
  roundNumber: number;
  winner: TeamSide;
  reason: RoundEndReason;
  mvp?: string;
  createdAt: string;
}

export type RoundEndReason = 'elimination' | 'bomb' | 'time' | 'defuse';

// ============================================
// BP (Ban/Pick) System
// ============================================

export interface BPSession {
  id: string;
  matchId: string;
  mapPool: string[];
  actions: BPAction[];
  currentPhase: BPPhase;
  activeTeam: TeamSide;
  countdown: number;
  status: BPStatus;
  createdAt: string;
  updatedAt: string;
}

export type BPPhase = 'ban' | 'pick';
export type BPStatus = 'active' | 'completed';

export interface BPAction {
  id: string;
  sessionId: string;
  type: BPPhase;
  team: TeamSide;
  map: string;
  order: number;
  timestamp: string;
}

// ============================================
// Overlay State
// ============================================

export interface OverlayComponentState {
  visible: boolean;
  opacity: number;
}

export interface OverlayState {
  scoreboard: OverlayComponentState;
  bp: OverlayComponentState;
  lowerThird: OverlayComponentState & { player?: Player };
  topBar: OverlayComponentState;
  mapVeto: OverlayComponentState;
  countdown: OverlayComponentState;
  replay: OverlayComponentState;
  break: OverlayComponentState;
  sponsor: OverlayComponentState;
  playerCam: OverlayComponentState;
}

export type OverlayName = keyof OverlayState;

// ============================================
// Event & Sponsor
// ============================================

export interface Event {
  id: string;
  name: string;
  logo: string;
  startDate: string;
  endDate: string;
  format: string;
  sponsors: Sponsor[];
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: SponsorTier;
  displayDuration: number;
}

export type SponsorTier = 'title' | 'main' | 'partner';

// ============================================
// WebSocket Event Payloads
// ============================================

// Client -> Server payloads
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

export interface OverlayScenePayload {
  sceneId: string;
}

// Server -> Client payloads
export interface SystemErrorPayload {
  code: string;
  message: string;
}

export interface SystemNotificationPayload {
  type: 'info' | 'warning' | 'success';
  message: string;
}

// ============================================
// WebSocket Event Maps (for type-safe emit/on)
// ============================================

export interface ClientToServerEvents {
  'match:scoreUpdate': (payload: ScoreUpdatePayload) => void;
  'match:roundUpdate': (payload: RoundUpdatePayload) => void;
  'match:statusChange': (payload: StatusChangePayload) => void;
  'bp:ban': (payload: BPBanPayload) => void;
  'bp:pick': (payload: BPPickPayload) => void;
  'bp:undo': (payload: BPUndoPayload) => void;
  'bp:reset': (payload: BPResetPayload) => void;
  'overlay:toggle': (payload: OverlayTogglePayload) => void;
  'overlay:scene': (payload: OverlayScenePayload) => void;
}

export interface ServerToClientEvents {
  'match:update': (payload: Match) => void;
  'bp:update': (payload: BPSession) => void;
  'overlay:update': (payload: OverlayState) => void;
  'player:statsUpdate': (payload: PlayerStats[]) => void;
  'system:error': (payload: SystemErrorPayload) => void;
  'system:notification': (payload: SystemNotificationPayload) => void;
}
