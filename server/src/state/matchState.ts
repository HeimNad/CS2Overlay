import { randomUUID } from 'crypto';
import type { Match, MatchFormat, MatchStatus, TeamSide, Team } from '../types';

function createTeam(name: string, shortName: string): Team {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    name,
    shortName,
    logo: '',
    country: '',
    players: [],
    score: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export class MatchStateManager {
  private match: Match | null = null;

  initMatch(
    teamAName: string,
    teamAShort: string,
    teamBName: string,
    teamBShort: string,
    format: MatchFormat
  ): Match {
    const now = new Date().toISOString();
    this.match = {
      id: randomUUID(),
      eventId: '',
      teamA: createTeam(teamAName, teamAShort),
      teamB: createTeam(teamBName, teamBShort),
      format,
      currentMap: 0,
      maps: [],
      status: 'upcoming',
      startTime: now,
      createdAt: now,
      updatedAt: now,
    };
    return this.match;
  }

  updateScore(team: TeamSide, delta: number): Match | null {
    if (!this.match) return null;
    const key = team === 'A' ? 'teamA' : 'teamB';
    this.match[key] = {
      ...this.match[key],
      score: Math.max(0, this.match[key].score + delta),
      updatedAt: new Date().toISOString(),
    };
    this.match.updatedAt = new Date().toISOString();
    return this.match;
  }

  changeStatus(status: MatchStatus): Match | null {
    if (!this.match) return null;
    this.match.status = status;
    this.match.updatedAt = new Date().toISOString();
    return this.match;
  }

  getMatch(): Match | null {
    return this.match;
  }

  reset(): void {
    this.match = null;
  }
}
