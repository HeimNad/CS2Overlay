'use client';

import { useSocketStore } from '@/stores/socketStore';

export default function DashboardPage() {
  const connectionState = useSocketStore((s) => s.connectionState);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <h3 className="text-sm text-zinc-500 mb-1">Server Status</h3>
          <p className="text-lg font-semibold capitalize">{connectionState}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <h3 className="text-sm text-zinc-500 mb-1">Current Match</h3>
          <p className="text-lg font-semibold text-zinc-600">No active match</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <h3 className="text-sm text-zinc-500 mb-1">Active Overlays</h3>
          <p className="text-lg font-semibold">0</p>
        </div>
      </div>
    </div>
  );
}
