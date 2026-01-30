'use client';

import { useSocketStore } from '@/stores/socketStore';
import { useMatchStore } from '@/stores/matchStore';
import { useBPStore } from '@/stores/bpStore';
import { useOverlayStore } from '@/stores/overlayStore';

export default function DashboardPage() {
  const connectionState = useSocketStore((s) => s.connectionState);
  const match = useMatchStore((s) => s.currentMatch);
  const session = useBPStore((s) => s.session);
  const overlayStates = useOverlayStore((s) => s.states);

  const activeOverlays = Object.values(overlayStates).filter((s) => s.visible).length;

  const bpProgress = session
    ? session.status === 'completed'
      ? 100
      : Math.round((session.actions.length / (session.mapPool.length - 1)) * 100)
    : 0;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Server Status */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-1 text-sm text-zinc-500">Server Status</h3>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                connectionState === 'connected'
                  ? 'bg-green-500'
                  : connectionState === 'connecting'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            <p className="text-lg font-semibold capitalize">{connectionState}</p>
          </div>
        </div>

        {/* Current Match */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-1 text-sm text-zinc-500">Current Match</h3>
          {match ? (
            <div>
              <p className="text-lg font-semibold">
                {match.teamA.shortName}{' '}
                <span className="text-zinc-500">
                  {match.teamA.score} : {match.teamB.score}
                </span>{' '}
                {match.teamB.shortName}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {match.format} &middot;{' '}
                <span className="capitalize">{match.status}</span>
              </p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-zinc-600">No active match</p>
          )}
        </div>

        {/* Active Overlays */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-1 text-sm text-zinc-500">Active Overlays</h3>
          <p className="text-lg font-semibold">{activeOverlays}</p>
        </div>
      </div>

      {/* BP Session row */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-1 text-sm text-zinc-500">BP Session</h3>
          {session ? (
            <div>
              <p className="text-lg font-semibold capitalize">
                {session.status === 'completed' ? 'Completed' : 'In Progress'}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${bpProgress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {session.actions.length} / {session.mapPool.length - 1} actions &middot;{' '}
                {session.format}
              </p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-zinc-600">No active session</p>
          )}
        </div>
      </div>
    </div>
  );
}
