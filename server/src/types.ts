// Re-export core types for backend use.
// In a monorepo setup these would come from a shared package;
// for now we duplicate the essential WebSocket event maps so the
// server stays self-contained while mirroring the frontend contract.

export type TeamSide = 'A' | 'B';
export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type MatchFormat = 'BO1' | 'BO3' | 'BO5';
export type BPPhase = 'ban' | 'pick';

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
  name: string;
  visible: boolean;
}

export interface OverlayScenePayload {
  sceneId: string;
}

export interface SystemErrorPayload {
  code: string;
  message: string;
}

export interface SystemNotificationPayload {
  type: 'info' | 'warning' | 'success';
  message: string;
}

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
  'match:update': (payload: unknown) => void;
  'bp:update': (payload: unknown) => void;
  'overlay:update': (payload: unknown) => void;
  'player:statsUpdate': (payload: unknown) => void;
  'system:error': (payload: SystemErrorPayload) => void;
  'system:notification': (payload: SystemNotificationPayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  role: 'overlay' | 'admin';
}
