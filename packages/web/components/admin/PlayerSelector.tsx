'use client';

import { useState } from 'react';
import { socketService } from '@/lib/socket';
import { useGSIStore } from '@/stores/gsiStore';
import { useMatchStore } from '@/stores/matchStore';
import { useOverlayStore } from '@/stores/overlayStore';
import type { Player } from '@/types';

function ManualPlayerForm({ onSelect }: { onSelect: (player: Player) => void }) {
  const [gameId, setGameId] = useState('');
  const [realName, setRealName] = useState('');
  const [country, setCountry] = useState('');
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [assists, setAssists] = useState(0);
  const [adr, setAdr] = useState(0);
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (!gameId.trim()) return;
    const now = new Date().toISOString();
    const player: Player = {
      id: crypto.randomUUID(),
      gameId: gameId.trim(),
      realName: realName.trim() || gameId.trim(),
      country: country.trim(),
      teamId: '',
      stats: { kills, deaths, assists, adr, rating },
      createdAt: now,
      updatedAt: now,
    };
    onSelect(player);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-300">Manual Input</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Game ID *</label>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-sm text-white placeholder-zinc-600"
            placeholder="s1mple"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Real Name</label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-sm text-white placeholder-zinc-600"
            placeholder="Oleksandr Kostyliev"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-sm text-white placeholder-zinc-600"
            placeholder="UA"
          />
        </div>
      </div>

      <h4 className="text-xs font-semibold text-zinc-400 mt-2">Stats</h4>
      <div className="grid grid-cols-5 gap-2">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">K</label>
          <input
            type="number"
            value={kills}
            onChange={(e) => setKills(Number(e.target.value))}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">D</label>
          <input
            type="number"
            value={deaths}
            onChange={(e) => setDeaths(Number(e.target.value))}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">A</label>
          <input
            type="number"
            value={assists}
            onChange={(e) => setAssists(Number(e.target.value))}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">ADR</label>
          <input
            type="number"
            step="0.1"
            value={adr}
            onChange={(e) => setAdr(Number(e.target.value))}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Rating</label>
          <input
            type="number"
            step="0.01"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-sm text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!gameId.trim()}
        className="mt-2 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Select Player
      </button>
    </div>
  );
}

export default function PlayerSelector() {
  const gsiState = useGSIStore((s) => s.gsiState);
  const match = useMatchStore((s) => s.currentMatch);
  const currentPlayer = useOverlayStore((s) => s.states.lowerThird.player);
  const lowerThirdVisible = useOverlayStore((s) => s.states.lowerThird.visible);

  const handleSelectPlayer = (player: Player) => {
    socketService.emit('overlay:selectPlayer', { player });
    if (!lowerThirdVisible) {
      socketService.emit('overlay:toggle', { name: 'lowerThird', visible: true });
    }
  };

  const handleClear = () => {
    socketService.emit('overlay:selectPlayer', { player: null });
  };

  const handleToggleVisibility = () => {
    socketService.emit('overlay:toggle', { name: 'lowerThird', visible: !lowerThirdVisible });
  };

  // Build player list from GSI if connected
  const gsiPlayers = gsiState.isConnected ? gsiState.players : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lower Third Control</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              lowerThirdVisible ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-zinc-400">
            {lowerThirdVisible ? 'Visible' : 'Hidden'}
          </span>
        </div>
      </div>

      {/* Current selection */}
      {currentPlayer && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Currently Showing</h3>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-bold">{currentPlayer.gameId}</span>
              {currentPlayer.realName && currentPlayer.realName !== currentPlayer.gameId && (
                <span className="ml-2 text-sm text-zinc-400">({currentPlayer.realName})</span>
              )}
              {currentPlayer.country && (
                <span className="ml-2 text-xs text-zinc-500">{currentPlayer.country}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleVisibility}
                className={`rounded px-3 py-1 text-xs font-medium ${
                  lowerThirdVisible
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {lowerThirdVisible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={handleClear}
                className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSI Player List */}
      {gsiPlayers.length > 0 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">
            GSI Players
            <span className="ml-2 text-xs font-normal text-green-400">LIVE</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {gsiPlayers.map((gsiPlayer) => {
              const now = new Date().toISOString();
              const player: Player = {
                id: gsiPlayer.steamId,
                gameId: gsiPlayer.name,
                realName: gsiPlayer.name,
                country: '',
                teamId: '',
                stats: {
                  kills: gsiPlayer.kills,
                  deaths: gsiPlayer.deaths,
                  assists: gsiPlayer.assists,
                  adr: 0,
                  rating: 0,
                },
                createdAt: now,
                updatedAt: now,
              };
              const isSelected = currentPlayer?.gameId === gsiPlayer.name;
              return (
                <button
                  key={gsiPlayer.steamId}
                  onClick={() => handleSelectPlayer(player)}
                  className={`flex items-center justify-between rounded border px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700'
                  }`}
                >
                  <div>
                    <span className="font-medium">{gsiPlayer.name}</span>
                    <span className={`ml-2 text-xs ${gsiPlayer.team === 'CT' ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {gsiPlayer.team}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {gsiPlayer.kills}/{gsiPlayer.deaths}/{gsiPlayer.assists}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Match Players */}
      {match && (match.teamA.players.length > 0 || match.teamB.players.length > 0) && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">Match Players</h3>
          {[match.teamA, match.teamB].map((team) => (
            <div key={team.id} className="mb-3 last:mb-0">
              <h4 className="mb-1 text-xs font-semibold text-zinc-500 uppercase">
                {team.shortName || team.name}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {team.players.map((player) => {
                  const isSelected = currentPlayer?.id === player.id;
                  return (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      className={`flex items-center justify-between rounded border px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700'
                      }`}
                    >
                      <span className="font-medium">{player.gameId}</span>
                      {player.country && (
                        <span className="text-xs text-zinc-500">{player.country}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual input (always available) */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
        <ManualPlayerForm onSelect={handleSelectPlayer} />
      </div>
    </div>
  );
}
