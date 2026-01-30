import { randomUUID } from 'crypto';
import type { MatchFormat, BPSession, BPAction } from '../types';
import { getFlowForFormat, type BPFlowStep } from './bpFlows';

const DEFAULT_MAP_POOL = ['Dust2', 'Mirage', 'Inferno', 'Nuke', 'Overpass', 'Vertigo', 'Ancient'];

export class BPStateManager {
  private session: BPSession | null = null;
  private flow: BPFlowStep[] = [];

  initSession(matchId: string, format: MatchFormat): BPSession {
    this.flow = getFlowForFormat(format);
    const now = new Date().toISOString();
    const firstStep = this.flow[0];

    this.session = {
      id: randomUUID(),
      matchId,
      format,
      mapPool: [...DEFAULT_MAP_POOL],
      actions: [],
      currentPhase: firstStep.phase,
      activeTeam: firstStep.team,
      countdown: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    return this.session;
  }

  applyAction(map: string): BPSession | null {
    if (!this.session || this.session.status === 'completed') return null;

    const stepIndex = this.session.actions.length;
    if (stepIndex >= this.flow.length) return null;

    // Validate map is in pool and not already used
    const usedMaps = new Set(this.session.actions.map((a) => a.map));
    if (!this.session.mapPool.includes(map)) return null;
    if (usedMaps.has(map)) return null;

    const step = this.flow[stepIndex];
    const action: BPAction = {
      id: randomUUID(),
      sessionId: this.session.id,
      type: step.phase,
      team: step.team,
      map,
      order: stepIndex,
      timestamp: new Date().toISOString(),
    };

    this.session.actions.push(action);
    this.session.updatedAt = new Date().toISOString();

    // Advance to next step or complete
    const nextIndex = stepIndex + 1;
    if (nextIndex >= this.flow.length) {
      // All steps done — remaining map is decider, session complete
      this.session.status = 'completed';
    } else {
      this.session.currentPhase = this.flow[nextIndex].phase;
      this.session.activeTeam = this.flow[nextIndex].team;
    }

    return this.session;
  }

  undo(): BPSession | null {
    if (!this.session || this.session.actions.length === 0) return null;

    this.session.actions.pop();
    this.session.updatedAt = new Date().toISOString();

    const currentIndex = this.session.actions.length;
    if (currentIndex < this.flow.length) {
      this.session.status = 'active';
      this.session.currentPhase = this.flow[currentIndex].phase;
      this.session.activeTeam = this.flow[currentIndex].team;
    }

    return this.session;
  }

  getSession(): BPSession | null {
    return this.session;
  }

  reset(): void {
    this.session = null;
    this.flow = [];
  }
}
