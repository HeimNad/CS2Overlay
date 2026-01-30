'use client';

import { useState } from 'react';
import { useBPStore } from '@/stores/bpStore';
import { socketService } from '@/lib/socket';
import { CS2_MAP_POOL, MAP_COLORS } from '@/lib/constants';
import type { MatchFormat, BPAction } from '@/types';

const FORMAT_OPTIONS: MatchFormat[] = ['BO1', 'BO3', 'BO5'];

// BP flow step definitions for timeline display
const FLOW_STEPS: Record<MatchFormat, { phase: 'ban' | 'pick'; team: 'A' | 'B' }[]> = {
  BO1: [
    { phase: 'ban', team: 'A' },
    { phase: 'ban', team: 'B' },
    { phase: 'ban', team: 'A' },
    { phase: 'ban', team: 'B' },
    { phase: 'ban', team: 'A' },
    { phase: 'ban', team: 'B' },
  ],
  BO3: [
    { phase: 'ban', team: 'A' },
    { phase: 'ban', team: 'B' },
    { phase: 'pick', team: 'A' },
    { phase: 'pick', team: 'B' },
    { phase: 'ban', team: 'A' },
    { phase: 'ban', team: 'B' },
  ],
  BO5: [
    { phase: 'pick', team: 'A' },
    { phase: 'pick', team: 'B' },
    { phase: 'ban', team: 'A' },
    { phase: 'ban', team: 'B' },
    { phase: 'pick', team: 'A' },
    { phase: 'pick', team: 'B' },
  ],
};

function StartSessionForm() {
  const [format, setFormat] = useState<MatchFormat>('BO3');

  const handleStart = () => {
    socketService.emit('bp:init', { format });
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">Start BP Session</h3>
      <div className="mb-4">
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
        onClick={handleStart}
        className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
      >
        Start BP Session
      </button>
    </div>
  );
}

function FlowTimeline({
  format,
  actions,
}: {
  format: MatchFormat;
  actions: BPAction[];
}) {
  const steps = FLOW_STEPS[format];
  const currentStep = actions.length;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h4 className="mb-3 text-sm font-medium text-zinc-400">Flow Timeline</h4>
      <div className="flex flex-wrap gap-1.5">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const action = actions[i];

          return (
            <div
              key={i}
              className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold uppercase ${
                active
                  ? 'bg-blue-600 text-white'
                  : done
                    ? 'bg-zinc-700 text-zinc-300'
                    : 'bg-zinc-800/50 text-zinc-600'
              }`}
            >
              <span>{step.team}</span>
              <span className={step.phase === 'ban' ? 'text-red-400' : 'text-emerald-400'}>
                {step.phase}
              </span>
              {done && action && (
                <span className="ml-0.5 text-zinc-400">{action.map}</span>
              )}
            </div>
          );
        })}
        {/* Decider indicator */}
        <div className="flex items-center gap-1 rounded bg-yellow-900/30 px-2 py-1 text-[11px] font-semibold uppercase text-yellow-500">
          Decider
        </div>
      </div>
    </div>
  );
}

function SessionPanel() {
  const session = useBPStore((s) => s.session);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!session) return null;

  const usedMaps = new Set(session.actions.map((a) => a.map));
  const isCompleted = session.status === 'completed';
  const deciderMap = isCompleted
    ? session.mapPool.find((m) => !usedMaps.has(m)) ?? null
    : null;

  const handleMapClick = (map: string) => {
    if (isCompleted || usedMaps.has(map)) return;
    socketService.emit('bp:action', { map });
  };

  const handleUndo = () => {
    socketService.emit('bp:undo', { actionId: '' });
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    socketService.emit('bp:reset', { sessionId: session.id });
    setConfirmReset(false);
  };

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        {isCompleted ? (
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-yellow-400">
              Veto Complete
            </span>
            {deciderMap && (
              <span className="ml-2 text-sm text-zinc-400">
                — Decider: <span className="font-semibold text-yellow-300">{deciderMap}</span>
              </span>
            )}
          </div>
        ) : (
          <div className="text-center">
            <span className="text-sm font-semibold text-zinc-400">
              Team {session.activeTeam} will{' '}
            </span>
            <span
              className={`text-sm font-bold uppercase ${
                session.currentPhase === 'ban' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {session.currentPhase}
            </span>
          </div>
        )}
      </div>

      {/* Map pool grid */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h4 className="mb-3 text-sm font-medium text-zinc-400">Map Pool</h4>
        <div className="grid grid-cols-4 gap-2">
          {CS2_MAP_POOL.map((map) => {
            const action = session.actions.find((a) => a.map === map);
            const isUsed = usedMaps.has(map);
            const isDecider = deciderMap === map;
            const bgColor = MAP_COLORS[map] || '#555';

            return (
              <button
                key={map}
                onClick={() => handleMapClick(map)}
                disabled={isUsed || isCompleted}
                className={`relative flex h-20 flex-col items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  isDecider
                    ? 'ring-2 ring-yellow-400'
                    : isUsed
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:scale-105 hover:brightness-110'
                }`}
                style={{ backgroundColor: bgColor }}
              >
                <span className="text-white drop-shadow">{map}</span>
                {action && (
                  <span
                    className={`mt-0.5 text-[10px] font-semibold uppercase ${
                      action.type === 'ban' ? 'text-red-300' : 'text-emerald-300'
                    }`}
                  >
                    {action.type} ({action.team})
                  </span>
                )}
                {isDecider && (
                  <span className="mt-0.5 text-[10px] font-bold uppercase text-yellow-300">
                    DECIDER
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flow timeline */}
      <FlowTimeline format={session.format} actions={session.actions} />

      {/* Action history */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h4 className="mb-3 text-sm font-medium text-zinc-400">Action History</h4>
        {session.actions.length === 0 ? (
          <p className="text-xs text-zinc-600">No actions yet</p>
        ) : (
          <div className="flex flex-col gap-1">
            {session.actions.map((action, i) => (
              <div key={action.id} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-zinc-600">{i + 1}.</span>
                <span className="font-semibold text-zinc-300">Team {action.team}</span>
                <span
                  className={`font-bold uppercase ${
                    action.type === 'ban' ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {action.type}
                </span>
                <span className="text-zinc-400">{action.map}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleUndo}
          disabled={session.actions.length === 0}
          className="flex-1 rounded bg-zinc-800 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={handleReset}
          className={`flex-1 rounded py-2 text-sm font-semibold transition-colors ${
            confirmReset
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-red-400 hover:bg-zinc-700'
          }`}
        >
          {confirmReset ? 'Confirm Reset' : 'Reset Session'}
        </button>
      </div>
    </div>
  );
}

export default function BPControl() {
  const session = useBPStore((s) => s.session);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">BP Control</h2>
      {session ? <SessionPanel /> : <StartSessionForm />}
    </div>
  );
}
