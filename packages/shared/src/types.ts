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
export interface MatchInitPayload {
  teamAName: string;
  teamAShortName: string;
  teamBName: string;
  teamBShortName: string;
  format: MatchFormat;
}

export interface BPInitPayload {
  format: MatchFormat;
}

export interface BPActionPayload {
  map: string;
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

export interface OverlaySelectPlayerPayload {
  player: Player | null;
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
  'overlay:selectPlayer': (payload: OverlaySelectPlayerPayload) => void;
  'overlay:setTheme': (payload: { theme: string }) => void;
  'state:requestSync': () => void;
  'gsi:requestState': () => void;
}

export interface ServerToClientEvents {
  'match:update': (payload: Match) => void;
  'match:cleared': () => void;
  'bp:update': (payload: BPSession) => void;
  'bp:cleared': () => void;
  'overlay:update': (payload: OverlayState) => void;
  'player:statsUpdate': (payload: PlayerStats[]) => void;
  'overlay:themeUpdate': (payload: { theme: string }) => void;
  'system:error': (payload: SystemErrorPayload) => void;
  'system:notification': (payload: SystemNotificationPayload) => void;
  'gsi:state': (payload: GSIState) => void;
  'gsi:roundEnd': (payload: GSIRoundEndPayload) => void;
  'gsi:mapEnd': (payload: GSIMapEndPayload) => void;
}

// ============================================
// GSI (Game State Integration) Types
// ============================================

export interface GSIAuth {
  token: string;
}

export interface GSIProvider {
  name: string;
  appid: number;
  version: number;
  steamid: string;
  timestamp: number;
}

export interface GSIMapTeam {
  score: number;
  consecutive_round_losses: number;
  timeouts_remaining: number;
  matches_won_this_series: number;
}

export interface GSIMap {
  mode: string;
  name: string;
  phase: GSIMapPhase;
  round: number;
  team_ct: GSIMapTeam;
  team_t: GSIMapTeam;
  num_matches_to_win_series: number;
}

export type GSIMapPhase = 'live' | 'warmup' | 'intermission' | 'gameover';

export interface GSIRound {
  phase: GSIRoundPhase;
  win_team?: 'CT' | 'T';
  bomb?: GSIBombState;
}

export type GSIRoundPhase = 'live' | 'freezetime' | 'over';
export type GSIBombState = 'planted' | 'exploded' | 'defused';

export interface GSIPlayerMatchStats {
  kills: number;
  assists: number;
  deaths: number;
  mvps: number;
  score: number;
}

export interface GSIPlayerState {
  health: number;
  armor: number;
  helmet: boolean;
  money: number;
  round_kills: number;
  round_killhs: number;
  round_totaldmg: number;
  equip_value: number;
}

export interface GSIAllPlayerEntry {
  name: string;
  observer_slot: number;
  team: 'CT' | 'T';
  match_stats: GSIPlayerMatchStats;
  state: GSIPlayerState;
}

export interface GSIPhaseCountdowns {
  phase: string;
  phase_ends_in: string;
}

export interface GSIBomb {
  state: GSIBombState;
  position: string;
  player?: string;
  countdown?: string;
}

export interface GSIPayload {
  auth?: GSIAuth;
  provider?: GSIProvider;
  map?: GSIMap;
  round?: GSIRound;
  allplayers?: Record<string, GSIAllPlayerEntry>;
  phase_countdowns?: GSIPhaseCountdowns;
  bomb?: GSIBomb;
  previously?: Partial<Omit<GSIPayload, 'auth' | 'previously'>>;
}

// Processed / normalized GSI state broadcast to clients

export interface GSIProcessedPlayer {
  steamId: string;
  name: string;
  observerSlot: number;
  team: 'CT' | 'T';
  kills: number;
  assists: number;
  deaths: number;
  mvps: number;
  score: number;
  health: number;
  armor: number;
  helmet: boolean;
  money: number;
  roundKills: number;
  roundKillHs: number;
  roundTotalDmg: number;
  equipValue: number;
}

export interface GSIState {
  isConnected: boolean;
  mapName: string;
  mapPhase: GSIMapPhase;
  round: number;
  roundPhase: GSIRoundPhase;
  ctScore: number;
  tScore: number;
  ctConsecutiveLosses: number;
  tConsecutiveLosses: number;
  ctTimeoutsRemaining: number;
  tTimeoutsRemaining: number;
  bomb: {
    state: GSIBombState | 'carried' | 'dropped';
    countdown?: string;
    player?: string;
  } | null;
  players: GSIProcessedPlayer[];
  phaseCountdown: {
    phase: string;
    endsIn: string;
  } | null;
  timestamp: number;
}

export interface GSIRoundEndPayload {
  winTeam: 'CT' | 'T';
  round: number;
}

export interface GSIMapEndPayload {
  mapName: string;
  ctScore: number;
  tScore: number;
}

// ============================================
// Socket.io Server Types
// ============================================

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  role: 'overlay' | 'admin';
}
