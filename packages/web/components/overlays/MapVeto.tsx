'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBPStore } from '@/stores/bpStore';
import { useOverlayStore } from '@/stores/overlayStore';
import { useMatchStore } from '@/stores/matchStore';
import { MAP_COLORS } from '@/lib/constants';
import { SPRING_CARD, FADE, staggerDelay } from '@/lib/animations';
import type { BPAction } from '@/types';

const VetoCard = React.memo(function VetoCard({
  mapName,
  action,
  isDecider,
  index,
  teamAName,
  teamBName,
}: {
  mapName: string;
  action?: BPAction;
  isDecider: boolean;
  index: number;
  teamAName: string;
  teamBName: string;
}) {
  const bgColor = MAP_COLORS[mapName] || '#555';
  const isBanned = action?.type === 'ban';
  const isPicked = action?.type === 'pick';

  const teamName = action
    ? action.team === 'A'
      ? teamAName
      : teamBName
    : '';

  let statusColor = 'bg-overlay-text-primary/10';
  let statusText = '';
  let statusTextColor = 'text-overlay-text-muted';

  if (isBanned) {
    statusColor = 'bg-overlay-ban/20';
    statusText = 'BAN';
    statusTextColor = 'text-overlay-ban';
  } else if (isPicked) {
    statusColor = 'bg-overlay-pick/20';
    statusText = 'PICK';
    statusTextColor = 'text-overlay-pick';
  } else if (isDecider) {
    statusColor = 'bg-yellow-500/20';
    statusText = 'DECIDER';
    statusTextColor = 'text-yellow-300';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: staggerDelay(index, 0.1), ...SPRING_CARD }}
      className="flex w-[140px] flex-col items-center overflow-hidden rounded-lg"
      style={{
        border: isDecider
          ? '2px solid #FFD700'
          : isBanned
            ? '2px solid rgba(239,68,68,0.3)'
            : isPicked
              ? '2px solid rgba(52,211,153,0.3)'
              : '2px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Map image area */}
      <div
        className="relative flex h-[100px] w-full items-center justify-center"
        style={{ background: bgColor }}
      >
        <span className="text-sm font-bold uppercase tracking-wider text-overlay-text-primary/90">
          {mapName}
        </span>
        {isBanned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-3xl font-black text-overlay-ban/70">✕</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className={`flex w-full flex-col items-center gap-1 px-3 py-2.5 ${statusColor}`}>
        {statusText && (
          <span className={`text-xs font-black uppercase tracking-widest ${statusTextColor}`}>
            {statusText}
            {isDecider && ' ★'}
          </span>
        )}
        {teamName && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-overlay-text-muted">
            {teamName}
          </span>
        )}
        {isDecider && !teamName && (
          <span className="text-[10px] text-overlay-text-primary/30">───</span>
        )}
      </div>
    </motion.div>
  );
});

export default function MapVeto() {
  const session = useBPStore((s) => s.session);
  const visible = useOverlayStore((s) => s.states.mapVeto.visible);
  const opacity = useOverlayStore((s) => s.states.mapVeto.opacity);
  const match = useMatchStore((s) => s.currentMatch);

  const show = visible && !!session;

  const usedMaps = session ? new Set(session.actions.map((a) => a.map)) : new Set<string>();
  const isCompleted = session?.status === 'completed';
  const deciderMap = isCompleted
    ? session?.mapPool.find((m) => !usedMaps.has(m)) ?? null
    : null;

  const teamAName = match?.teamA.shortName || match?.teamA.name || 'Team A';
  const teamBName = match?.teamB.shortName || match?.teamB.name || 'Team B';

  return (
    <AnimatePresence>
      {show && session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          style={{ opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 bg-overlay-bg-secondary" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-overlay-text-primary">
                MAP VETO
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-overlay-text-secondary">{teamAName}</span>
                <span className="rounded bg-overlay-text-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-overlay-text-muted">
                  {session.format}
                </span>
                <span className="text-sm font-bold text-overlay-text-secondary">{teamBName}</span>
              </div>
            </motion.div>

            {/* Map grid */}
            <div className="flex gap-3">
              {session.mapPool.map((mapName, index) => {
                const action = session.actions.find((a) => a.map === mapName);
                const isDeciderMap = deciderMap === mapName;
                return (
                  <VetoCard
                    key={mapName}
                    mapName={mapName}
                    action={action}
                    isDecider={isDeciderMap}
                    index={index}
                    teamAName={teamAName}
                    teamBName={teamBName}
                  />
                );
              })}
            </div>

            {/* Status */}
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-full bg-yellow-500/20 px-6 py-2"
              >
                <span className="text-sm font-bold uppercase tracking-wider text-yellow-300">
                  Veto Complete
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
