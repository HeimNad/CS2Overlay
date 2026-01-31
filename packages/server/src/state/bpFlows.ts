import type { MatchFormat, BPPhase, TeamSide } from '@cs2overlay/shared';

export interface BPFlowStep {
  phase: BPPhase;
  team: TeamSide;
}

const BO1_FLOW: BPFlowStep[] = [
  { phase: 'ban', team: 'A' },
  { phase: 'ban', team: 'B' },
  { phase: 'ban', team: 'A' },
  { phase: 'ban', team: 'B' },
  { phase: 'ban', team: 'A' },
  { phase: 'ban', team: 'B' },
  // Remaining 1 map = decider
];

const BO3_FLOW: BPFlowStep[] = [
  { phase: 'ban', team: 'A' },
  { phase: 'ban', team: 'B' },
  { phase: 'pick', team: 'A' },
  { phase: 'pick', team: 'B' },
  { phase: 'ban', team: 'A' },
  { phase: 'ban', team: 'B' },
  // Remaining 1 map = decider
];

const BO5_FLOW: BPFlowStep[] = [
  { phase: 'pick', team: 'A' },
  { phase: 'pick', team: 'B' },
  { phase: 'ban', team: 'A' },
  { phase: 'ban', team: 'B' },
  { phase: 'pick', team: 'A' },
  { phase: 'pick', team: 'B' },
  // Remaining 1 map = decider
];

const FLOWS: Record<MatchFormat, BPFlowStep[]> = {
  BO1: BO1_FLOW,
  BO3: BO3_FLOW,
  BO5: BO5_FLOW,
};

export function getFlowForFormat(format: MatchFormat): BPFlowStep[] {
  return FLOWS[format];
}
