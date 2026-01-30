'use client';

import { useState } from 'react';
import { useMatchStore } from '@/stores/matchStore';
import { socketService } from '@/lib/socket';
import type { MatchFormat } from '@/types';

const FORMAT_OPTIONS: MatchFormat[] = ['BO1', 'BO3', 'BO5'];

function CreateMatchForm() {
  const [teamAName, setTeamAName] = useState('');
  const [teamAShort, setTeamAShort] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [teamBShort, setTeamBShort] = useState('');
  const [format, setFormat] = useState<MatchFormat>('BO3');

  const canCreate = teamAName.trim() && teamAShort.trim() && teamBName.trim() && teamBShort.trim();

  const handleCreate = () => {
    if (!canCreate) return;
    socketService.emit('match:init', {
      teamAName: teamAName.trim(),
      teamAShortName: teamAShort.trim(),
      teamBName: teamBName.trim(),
      teamBShortName: teamBShort.trim(),
      format,
    });
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">Create Match</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Team A */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-400">Team A</h4>
          <input
            type="text"
            placeholder="Team name"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Short name (e.g. NAVI)"
            maxLength={5}
            value={teamAShort}
            onChange={(e) => setTeamAShort(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Team B */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-400">Team B</h4>
          <input
            type="text"
            placeholder="Team name"
            value={teamBName}
            onChange={(e) => setTeamBName(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Short name (e.g. FAZE)"
            maxLength={5}
            value={teamBShort}
            onChange={(e) => setTeamBShort(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Format selector */}
      <div className="mt-4">
        <h4 className="mb-2 text-sm font-medium text-zinc-400">Format</h4>
        <div className="flex gap-2">
          {FORMAT_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
                format === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={!canCreate}
        className="mt-6 w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Create Match
      </button>
    </div>
  );
}

function ScorePanel() {
  const match = useMatchStore((s) => s.currentMatch);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!match) return null;

  const handleScore = (team: 'A' | 'B', delta: number) => {
    socketService.emit('match:scoreUpdate', { team, delta });
  };

  const handleStatusChange = (status: 'upcoming' | 'live' | 'finished') => {
    socketService.emit('match:statusChange', { status });
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    socketService.emit('match:reset');
    setConfirmReset(false);
  };

  return (
    <div className="space-y-4">
      {/* Score control */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-lg font-semibold">Score Control</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Team A */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              {match.teamA.shortName || match.teamA.name}
            </span>
            <span className="text-5xl font-black tabular-nums text-white">
              {match.teamA.score}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleScore('A', -1)}
                className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                -1
              </button>
              <button
                onClick={() => handleScore('A', 1)}
                className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                +1
              </button>
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              {match.teamB.shortName || match.teamB.name}
            </span>
            <span className="text-5xl font-black tabular-nums text-white">
              {match.teamB.score}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleScore('B', -1)}
                className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
              >
                -1
              </button>
              <button
                onClick={() => handleScore('B', 1)}
                className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Match info & actions */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="mb-4 text-lg font-semibold">Match Info</h3>
        <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Format</span>
            <p className="font-semibold">{match.format}</p>
          </div>
          <div>
            <span className="text-zinc-500">Status</span>
            <p className="font-semibold capitalize">{match.status}</p>
          </div>
          <div>
            <span className="text-zinc-500">Map</span>
            <p className="font-semibold">{match.currentMap + 1}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange('upcoming')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              match.status === 'upcoming'
                ? 'bg-yellow-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => handleStatusChange('live')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              match.status === 'live'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => handleStatusChange('finished')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              match.status === 'finished'
                ? 'bg-zinc-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Finished
          </button>

          <div className="flex-1" />

          <button
            onClick={handleReset}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              confirmReset
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-red-400 hover:bg-zinc-700'
            }`}
          >
            {confirmReset ? 'Confirm Reset' : 'Reset Match'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MatchControl() {
  const match = useMatchStore((s) => s.currentMatch);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Match Control</h2>
      {match ? <ScorePanel /> : <CreateMatchForm />}
    </div>
  );
}
