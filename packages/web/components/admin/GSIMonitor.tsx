'use client';

import { useGSIStore } from '@/stores/gsiStore';

const PHASE_COLORS: Record<string, string> = {
  live: 'text-green-400',
  warmup: 'text-yellow-400',
  intermission: 'text-blue-400',
  gameover: 'text-red-400',
  freezetime: 'text-cyan-400',
  over: 'text-zinc-400',
};

export default function GSIMonitor() {
  const gsiState = useGSIStore((s) => s.gsiState);
  const getPlayersByTeam = useGSIStore((s) => s.getPlayersByTeam);

  const ctPlayers = getPlayersByTeam('CT');
  const tPlayers = getPlayersByTeam('T');

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">GSI Monitor</h2>

      {/* Connection Status */}
      <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              gsiState.isConnected ? 'bg-green-500' : 'bg-zinc-600'
            }`}
          />
          <span className="text-lg font-semibold">
            {gsiState.isConnected ? 'CS2 GSI Connected' : 'Waiting for CS2 GSI data...'}
          </span>
          {gsiState.timestamp > 0 && (
            <span className="ml-auto text-xs text-zinc-500">
              Last update: {new Date(gsiState.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {!gsiState.isConnected ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-500">
            No GSI data received. Make sure CS2 is running with the GSI config installed.
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Copy <code className="rounded bg-zinc-800 px-1.5 py-0.5">gamestate_integration_cs2overlay.cfg</code> to your CS2 cfg directory.
          </p>
        </div>
      ) : (
        <>
          {/* Map Info + Round Phase + Bomb */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            {/* Map Info */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-2 text-sm text-zinc-500">Map</h3>
              <p className="text-xl font-bold">{gsiState.mapName}</p>
              <p className="mt-1 text-sm">
                Phase:{' '}
                <span className={PHASE_COLORS[gsiState.mapPhase] || 'text-zinc-400'}>
                  {gsiState.mapPhase}
                </span>
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span>
                  <span className="text-blue-400">CT</span>{' '}
                  <span className="text-xl font-bold">{gsiState.ctScore}</span>
                </span>
                <span className="text-zinc-600">:</span>
                <span>
                  <span className="text-xl font-bold">{gsiState.tScore}</span>{' '}
                  <span className="text-yellow-400">T</span>
                </span>
              </div>
            </div>

            {/* Round Phase */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-2 text-sm text-zinc-500">Round</h3>
              <p className="text-xl font-bold">Round {gsiState.round}</p>
              <p className="mt-1 text-sm">
                Phase:{' '}
                <span className={PHASE_COLORS[gsiState.roundPhase] || 'text-zinc-400'}>
                  {gsiState.roundPhase}
                </span>
              </p>
              {gsiState.phaseCountdown && (
                <p className="mt-2 text-sm text-zinc-400">
                  {gsiState.phaseCountdown.phase}:{' '}
                  <span className="font-mono">{gsiState.phaseCountdown.endsIn}s</span>
                </p>
              )}
            </div>

            {/* Bomb Status */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-2 text-sm text-zinc-500">Bomb</h3>
              {gsiState.bomb ? (
                <div>
                  <p className="text-xl font-bold capitalize">{gsiState.bomb.state}</p>
                  {gsiState.bomb.countdown && (
                    <p className="mt-1 text-sm font-mono text-red-400">
                      {gsiState.bomb.countdown}s
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-lg text-zinc-600">N/A</p>
              )}
            </div>
          </div>

          {/* Economy */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-1 text-sm text-zinc-500">CT Economy</h3>
              <p className="text-xs text-zinc-400">
                Loss streak: {gsiState.ctConsecutiveLosses} &middot; Timeouts: {gsiState.ctTimeoutsRemaining}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-1 text-sm text-zinc-500">T Economy</h3>
              <p className="text-xs text-zinc-400">
                Loss streak: {gsiState.tConsecutiveLosses} &middot; Timeouts: {gsiState.tTimeoutsRemaining}
              </p>
            </div>
          </div>

          {/* Player Tables */}
          <div className="grid grid-cols-2 gap-4">
            {/* CT Players */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-sm font-semibold text-blue-400">CT Players</h3>
              {ctPlayers.length === 0 ? (
                <p className="text-xs text-zinc-600">No players</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500">
                      <th className="pb-1 text-left">Player</th>
                      <th className="pb-1 text-right">HP</th>
                      <th className="pb-1 text-right">K</th>
                      <th className="pb-1 text-right">D</th>
                      <th className="pb-1 text-right">A</th>
                      <th className="pb-1 text-right">$</th>
                      <th className="pb-1 text-right">Equip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ctPlayers.map((p) => (
                      <tr key={p.steamId} className="border-t border-zinc-800">
                        <td className="py-1 text-zinc-300">{p.name}</td>
                        <td className={`py-1 text-right ${p.health > 0 ? 'text-green-400' : 'text-red-500'}`}>
                          {p.health}
                        </td>
                        <td className="py-1 text-right text-zinc-300">{p.kills}</td>
                        <td className="py-1 text-right text-zinc-400">{p.deaths}</td>
                        <td className="py-1 text-right text-zinc-400">{p.assists}</td>
                        <td className="py-1 text-right text-yellow-400">${p.money}</td>
                        <td className="py-1 text-right text-zinc-400">${p.equipValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* T Players */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-sm font-semibold text-yellow-400">T Players</h3>
              {tPlayers.length === 0 ? (
                <p className="text-xs text-zinc-600">No players</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500">
                      <th className="pb-1 text-left">Player</th>
                      <th className="pb-1 text-right">HP</th>
                      <th className="pb-1 text-right">K</th>
                      <th className="pb-1 text-right">D</th>
                      <th className="pb-1 text-right">A</th>
                      <th className="pb-1 text-right">$</th>
                      <th className="pb-1 text-right">Equip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tPlayers.map((p) => (
                      <tr key={p.steamId} className="border-t border-zinc-800">
                        <td className="py-1 text-zinc-300">{p.name}</td>
                        <td className={`py-1 text-right ${p.health > 0 ? 'text-green-400' : 'text-red-500'}`}>
                          {p.health}
                        </td>
                        <td className="py-1 text-right text-zinc-300">{p.kills}</td>
                        <td className="py-1 text-right text-zinc-400">{p.deaths}</td>
                        <td className="py-1 text-right text-zinc-400">{p.assists}</td>
                        <td className="py-1 text-right text-yellow-400">${p.money}</td>
                        <td className="py-1 text-right text-zinc-400">${p.equipValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
