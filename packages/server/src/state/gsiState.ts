import type {
  GSIPayload,
  GSIState,
  GSIMapPhase,
  GSIRoundPhase,
  GSIProcessedPlayer,
  GSIRoundEndPayload,
  GSIMapEndPayload,
} from '@cs2overlay/shared';

function createDefaultState(): GSIState {
  return {
    isConnected: false,
    mapName: '',
    mapPhase: 'warmup',
    round: 0,
    roundPhase: 'freezetime',
    ctScore: 0,
    tScore: 0,
    ctConsecutiveLosses: 0,
    tConsecutiveLosses: 0,
    ctTimeoutsRemaining: 1,
    tTimeoutsRemaining: 1,
    bomb: null,
    players: [],
    phaseCountdown: null,
    timestamp: 0,
  };
}

export interface GSIProcessResult {
  state: GSIState;
  roundEnd: GSIRoundEndPayload | null;
  mapEnd: GSIMapEndPayload | null;
}

export class GSIStateManager {
  private state: GSIState = createDefaultState();
  private authToken: string | null = null;
  private lastRound = 0;
  private lastRoundPhase: GSIRoundPhase = 'freezetime';
  private lastMapPhase: GSIMapPhase = 'warmup';
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private disconnectCallback: (() => void) | null = null;
  private readonly HEARTBEAT_TIMEOUT_MS = 60000;

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  validateAuth(payload: GSIPayload): boolean {
    if (!this.authToken) return true;
    return payload.auth?.token === this.authToken;
  }

  processPayload(payload: GSIPayload): GSIProcessResult {
    this.resetHeartbeat();

    let roundEnd: GSIRoundEndPayload | null = null;
    let mapEnd: GSIMapEndPayload | null = null;

    // Process map data
    if (payload.map) {
      const map = payload.map;
      this.state.mapName = map.name;
      this.state.mapPhase = map.phase;
      this.state.round = map.round;
      this.state.ctScore = map.team_ct.score;
      this.state.tScore = map.team_t.score;
      this.state.ctConsecutiveLosses = map.team_ct.consecutive_round_losses;
      this.state.tConsecutiveLosses = map.team_t.consecutive_round_losses;
      this.state.ctTimeoutsRemaining = map.team_ct.timeouts_remaining;
      this.state.tTimeoutsRemaining = map.team_t.timeouts_remaining;

      // Detect map end: phase changed to 'gameover'
      if (map.phase === 'gameover' && this.lastMapPhase !== 'gameover') {
        mapEnd = {
          mapName: map.name,
          ctScore: map.team_ct.score,
          tScore: map.team_t.score,
        };
      }
      this.lastMapPhase = map.phase;
    }

    // Process round data
    if (payload.round) {
      const round = payload.round;
      this.state.roundPhase = round.phase;

      // Detect round end: phase changed to 'over' with a winner
      if (
        round.phase === 'over' &&
        this.lastRoundPhase !== 'over' &&
        round.win_team
      ) {
        roundEnd = {
          winTeam: round.win_team,
          round: this.state.round,
        };
      }
      this.lastRoundPhase = round.phase;
    }

    // Process bomb data
    if (payload.bomb) {
      this.state.bomb = {
        state: payload.bomb.state,
        countdown: payload.bomb.countdown,
        player: payload.bomb.player,
      };
    } else if (payload.round && !payload.bomb) {
      this.state.bomb = null;
    }

    // Process phase countdowns
    if (payload.phase_countdowns) {
      this.state.phaseCountdown = {
        phase: payload.phase_countdowns.phase,
        endsIn: payload.phase_countdowns.phase_ends_in,
      };
    }

    // Process all players
    if (payload.allplayers) {
      this.state.players = Object.entries(payload.allplayers).map(
        ([steamId, p]): GSIProcessedPlayer => ({
          steamId,
          name: p.name,
          observerSlot: p.observer_slot,
          team: p.team,
          kills: p.match_stats.kills,
          assists: p.match_stats.assists,
          deaths: p.match_stats.deaths,
          mvps: p.match_stats.mvps,
          score: p.match_stats.score,
          health: p.state.health,
          armor: p.state.armor,
          helmet: p.state.helmet,
          money: p.state.money,
          roundKills: p.state.round_kills,
          roundKillHs: p.state.round_killhs,
          roundTotalDmg: p.state.round_totaldmg,
          equipValue: p.state.equip_value,
        })
      );
    }

    this.state.isConnected = true;
    this.state.timestamp = Date.now();

    return { state: { ...this.state }, roundEnd, mapEnd };
  }

  getState(): GSIState {
    return { ...this.state };
  }

  reset(): void {
    this.state = createDefaultState();
    this.lastRound = 0;
    this.lastRoundPhase = 'freezetime';
    this.lastMapPhase = 'warmup';
    this.clearHeartbeat();
  }

  onDisconnect(callback: () => void): void {
    this.disconnectCallback = callback;
  }

  private resetHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimeout = setTimeout(() => {
      console.log('[GSI] Heartbeat timeout — no data received for 60s');
      this.state.isConnected = false;
      this.disconnectCallback?.();
    }, this.HEARTBEAT_TIMEOUT_MS);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }
}
