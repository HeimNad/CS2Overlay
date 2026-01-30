import { z } from 'zod';

// ============================================
// Enum Schemas
// ============================================

export const MatchFormatSchema = z.enum(['BO1', 'BO3', 'BO5']);
export const MatchStatusSchema = z.enum(['upcoming', 'live', 'finished']);
export const TeamSideSchema = z.enum(['A', 'B']);
export const BPPhaseSchema = z.enum(['ban', 'pick']);
export const BPStatusSchema = z.enum(['active', 'completed']);
export const RoundEndReasonSchema = z.enum(['elimination', 'bomb', 'time', 'defuse']);
export const SponsorTierSchema = z.enum(['title', 'main', 'partner']);

// ============================================
// Core Model Schemas
// ============================================

export const PlayerStatsSchema = z.object({
  kills: z.number().int().min(0),
  deaths: z.number().int().min(0),
  assists: z.number().int().min(0),
  adr: z.number().min(0),
  rating: z.number().min(0),
});

export const PlayerSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  realName: z.string(),
  country: z.string(),
  avatar: z.string().optional(),
  teamId: z.string(),
  stats: PlayerStatsSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  shortName: z.string().min(1).max(5),
  logo: z.string(),
  country: z.string(),
  players: z.array(PlayerSchema),
  score: z.number().int().min(0),
  economy: z.number().int().min(0).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RoundSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  roundNumber: z.number().int().min(1),
  winner: TeamSideSchema,
  reason: RoundEndReasonSchema,
  mvp: z.string().optional(),
  createdAt: z.string(),
});

export const GameMapSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  name: z.string(),
  order: z.number().int().min(1),
  scoreA: z.number().int().min(0),
  scoreB: z.number().int().min(0),
  status: MatchStatusSchema,
  rounds: z.array(RoundSchema),
  winner: TeamSideSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MatchSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  teamA: TeamSchema,
  teamB: TeamSchema,
  format: MatchFormatSchema,
  currentMap: z.number().int().min(0),
  maps: z.array(GameMapSchema),
  status: MatchStatusSchema,
  startTime: z.string(),
  endTime: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// BP Schemas
// ============================================

export const BPActionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  type: BPPhaseSchema,
  team: TeamSideSchema,
  map: z.string(),
  order: z.number().int().min(0),
  timestamp: z.string(),
});

export const BPSessionSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  mapPool: z.array(z.string()).min(1),
  actions: z.array(BPActionSchema),
  currentPhase: BPPhaseSchema,
  activeTeam: TeamSideSchema,
  countdown: z.number().int().min(0),
  status: BPStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// WebSocket Payload Schemas
// ============================================

export const ScoreUpdateSchema = z.object({
  team: TeamSideSchema,
  delta: z.number().int(),
});

export const RoundUpdateSchema = z.object({
  mapId: z.string(),
  winner: TeamSideSchema,
});

export const StatusChangeSchema = z.object({
  status: MatchStatusSchema,
});

export const BPBanSchema = z.object({
  team: TeamSideSchema,
  map: z.string().min(1),
});

export const BPPickSchema = z.object({
  team: TeamSideSchema,
  map: z.string().min(1),
});

export const BPUndoSchema = z.object({
  actionId: z.string(),
});

export const BPResetSchema = z.object({
  sessionId: z.string(),
});

export const OverlayToggleSchema = z.object({
  name: z.string().min(1),
  visible: z.boolean(),
});

export const OverlaySceneSchema = z.object({
  sceneId: z.string(),
});

// ============================================
// Utility
// ============================================

export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
