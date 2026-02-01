'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { useGSIStore } from '@/stores/gsiStore';
import { useMatchStore } from '@/stores/matchStore';
import type { Player, PlayerStats } from '@/types';

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

function CountryFlag({ country }: { country: string }) {
  if (!country) return null;
  return (
    <span className="text-2xl leading-none" title={country}>
      {country}
    </span>
  );
}

export default function LowerThird() {
  const visible = useOverlayStore((s) => s.states.lowerThird.visible);
  const opacity = useOverlayStore((s) => s.states.lowerThird.opacity);
  const player = useOverlayStore((s) => s.states.lowerThird.player);
  const gsiState = useGSIStore((s) => s.gsiState);
  const match = useMatchStore((s) => s.currentMatch);

  const show = visible && !!player;

  // Try to find GSI live stats for this player
  let liveStats: PlayerStats | undefined;
  if (gsiState.isConnected && player) {
    const gsiPlayer = gsiState.players.find(
      (p) => p.name === player.gameId || p.name === player.realName
    );
    if (gsiPlayer) {
      liveStats = {
        kills: gsiPlayer.kills,
        deaths: gsiPlayer.deaths,
        assists: gsiPlayer.assists,
        adr: 0,
        rating: 0,
      };
    }
  }

  const stats = liveStats || player?.stats;

  // Find team name for this player
  let teamName = '';
  if (match && player) {
    const inA = match.teamA.players.some((p) => p.id === player.id);
    const inB = match.teamB.players.some((p) => p.id === player.id);
    if (inA) teamName = match.teamA.shortName || match.teamA.name;
    else if (inB) teamName = match.teamB.shortName || match.teamB.name;
  }

  return (
    <AnimatePresence>
      {show && player && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ opacity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-stretch rounded-lg bg-black/85 shadow-2xl shadow-black/50 backdrop-blur-sm">
            {/* Left: Player identity */}
            <div className="flex items-center gap-4 border-r border-white/10 px-6 py-4">
              <CountryFlag country={player.country} />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">
                  {player.realName || player.gameId}
                </span>
                <span className="text-sm font-semibold text-yellow-400">
                  {player.gameId}
                </span>
                {teamName && (
                  <span className="text-xs text-white/50">
                    {teamName}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Stats */}
            {stats && (
              <div className="flex items-center gap-5 px-6 py-4">
                <StatBlock label="K" value={stats.kills} />
                <span className="text-white/20">/</span>
                <StatBlock label="D" value={stats.deaths} />
                <span className="text-white/20">/</span>
                <StatBlock label="A" value={stats.assists} />
                {stats.adr > 0 && (
                  <>
                    <div className="mx-1 h-8 w-px bg-white/10" />
                    <StatBlock label="ADR" value={stats.adr.toFixed(1)} />
                  </>
                )}
                {stats.rating > 0 && (
                  <>
                    <div className="mx-1 h-8 w-px bg-white/10" />
                    <StatBlock label="Rating" value={stats.rating.toFixed(2)} />
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
