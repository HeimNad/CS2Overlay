'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { useGSIStore } from '@/stores/gsiStore';
import { useMatchStore } from '@/stores/matchStore';
import { SPRING_SMOOTH } from '@/lib/animations';
import type { Player, PlayerStats } from '@/types';

const StatBlock = React.memo(function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-overlay-text-muted">
        {label}
      </span>
      <span className="font-mono text-sm font-bold tabular-nums text-overlay-text-primary">
        {value}
      </span>
    </div>
  );
});

const CountryFlag = React.memo(function CountryFlag({ country }: { country: string }) {
  if (!country) return null;
  return (
    <span className="text-2xl leading-none" title={country}>
      {country}
    </span>
  );
});

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
          transition={SPRING_SMOOTH}
          style={{ opacity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-stretch rounded-lg border border-overlay-border-subtle bg-overlay-bg-primary shadow-2xl shadow-overlay-shadow backdrop-blur-sm">
            {/* Left: Player identity */}
            <div className="flex items-center gap-4 border-r border-overlay-border px-6 py-4">
              <CountryFlag country={player.country} />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-overlay-text-primary">
                  {player.realName || player.gameId}
                </span>
                <span className="text-sm font-semibold text-overlay-highlight">
                  {player.gameId}
                </span>
                {teamName && (
                  <span className="text-xs text-overlay-text-muted">
                    {teamName}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Stats */}
            {stats && (
              <div className="flex items-center gap-5 px-6 py-4">
                <StatBlock label="K" value={stats.kills} />
                <span className="text-overlay-text-primary/20">/</span>
                <StatBlock label="D" value={stats.deaths} />
                <span className="text-overlay-text-primary/20">/</span>
                <StatBlock label="A" value={stats.assists} />
                {stats.adr > 0 && (
                  <>
                    <div className="mx-1 h-8 w-px bg-overlay-border" />
                    <StatBlock label="ADR" value={stats.adr.toFixed(1)} />
                  </>
                )}
                {stats.rating > 0 && (
                  <>
                    <div className="mx-1 h-8 w-px bg-overlay-border" />
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
