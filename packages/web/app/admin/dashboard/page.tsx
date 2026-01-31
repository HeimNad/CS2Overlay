'use client';

import { useEffect, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { useMatchStore } from '@/stores/matchStore';
import { useBPStore } from '@/stores/bpStore';
import { useOverlayStore } from '@/stores/overlayStore';
import { socketService } from '@/lib/socket';
import type { OverlayName, SystemErrorPayload, SystemNotificationPayload } from '@/types';

const OVERLAY_LABELS: Record<OverlayName, string> = {
  scoreboard: 'Scoreboard',
  bp: 'Ban/Pick',
  lowerThird: 'Lower Third',
  topBar: 'Top Bar',
  mapVeto: 'Map Veto',
  countdown: 'Countdown',
  replay: 'Replay',
  break: 'Break',
  sponsor: 'Sponsor',
  playerCam: 'Player Cam',
};

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: number;
}

let notifId = 0;

export default function DashboardPage() {
  const connectionState = useSocketStore((s) => s.connectionState);
  const match = useMatchStore((s) => s.currentMatch);
  const session = useBPStore((s) => s.session);
  const overlayStates = useOverlayStore((s) => s.states);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const activeOverlays = Object.values(overlayStates).filter((s) => s.visible).length;

  const bpProgress = session
    ? session.status === 'completed'
      ? 100
      : Math.round((session.actions.length / (session.mapPool.length - 1)) * 100)
    : 0;

  useEffect(() => {
    const handleNotification = (payload: SystemNotificationPayload) => {
      setNotifications((prev) => [
        { id: ++notifId, type: payload.type, message: payload.message, timestamp: Date.now() },
        ...prev,
      ].slice(0, 20));
    };

    const handleError = (payload: SystemErrorPayload) => {
      setNotifications((prev) => [
        { id: ++notifId, type: 'error' as const, message: `[${payload.code}] ${payload.message}`, timestamp: Date.now() },
        ...prev,
      ].slice(0, 20));
    };

    socketService.on('system:notification', handleNotification);
    socketService.on('system:error', handleError);

    return () => {
      socketService.off('system:notification', handleNotification);
      socketService.off('system:error', handleError);
    };
  }, []);

  const handleQuickToggle = (name: OverlayName) => {
    const current = overlayStates[name].visible;
    socketService.emit('overlay:toggle', { name, visible: !current });
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>

      {/* Top row: status cards */}
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
          <p className="text-lg font-semibold">
            {activeOverlays}
            <span className="text-sm font-normal text-zinc-500"> / 10</span>
          </p>
        </div>
      </div>

      {/* Second row: BP + Quick Actions */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* BP Session */}
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

        {/* Quick Actions */}
        <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm text-zinc-500">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickToggle('scoreboard')}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                overlayStates.scoreboard.visible
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {overlayStates.scoreboard.visible ? 'Hide' : 'Show'} Scoreboard
            </button>
            <button
              onClick={() => handleQuickToggle('bp')}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                overlayStates.bp.visible
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {overlayStates.bp.visible ? 'Hide' : 'Show'} Ban/Pick
            </button>
            <button
              onClick={() => handleQuickToggle('topBar')}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                overlayStates.topBar.visible
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {overlayStates.topBar.visible ? 'Hide' : 'Show'} Top Bar
            </button>
            <button
              onClick={() => handleQuickToggle('lowerThird')}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                overlayStates.lowerThird.visible
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {overlayStates.lowerThird.visible ? 'Hide' : 'Show'} Lower Third
            </button>
          </div>
        </div>
      </div>

      {/* Third row: Overlay Status Overview + Notifications */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Overlay Status Overview */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm text-zinc-500">Overlay Status</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {(Object.keys(OVERLAY_LABELS) as OverlayName[]).map((name) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    overlayStates[name].visible ? 'bg-green-500' : 'bg-zinc-600'
                  }`}
                />
                <span className="text-xs text-zinc-400">{OVERLAY_LABELS[name]}</span>
                {overlayStates[name].opacity < 1 && (
                  <span className="text-[10px] text-zinc-600">
                    {Math.round(overlayStates[name].opacity * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm text-zinc-500">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-zinc-600">No notifications yet</p>
          ) : (
            <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-2 text-xs">
                  <div
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      n.type === 'error'
                        ? 'bg-red-500'
                        : n.type === 'warning'
                          ? 'bg-yellow-500'
                          : n.type === 'success'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-zinc-400">{n.message}</span>
                  <span className="ml-auto shrink-0 text-[10px] text-zinc-600">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
