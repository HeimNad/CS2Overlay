'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBPStore } from '@/stores/bpStore';
import { useOverlayStore } from '@/stores/overlayStore';
import { MAP_COLORS } from '@/lib/constants';
import { SPRING_CARD, SPRING_SNAPPY, FADE, staggerDelay } from '@/lib/animations';
import type { BPAction } from '@/types';

const MapCard = React.memo(function MapCard({
  mapName,
  action,
  isDecider,
  index,
}: {
  mapName: string;
  action?: BPAction;
  isDecider: boolean;
  index: number;
}) {
  const bgColor = MAP_COLORS[mapName] || '#555';
  const isBanned = action?.type === 'ban';
  const isPicked = action?.type === 'pick';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: staggerDelay(index), ...SPRING_CARD }}
      className="relative flex h-[160px] w-[120px] flex-col items-center justify-end overflow-hidden rounded-lg"
      style={{
        background: bgColor,
        border: isDecider
          ? '2px solid #FFD700'
          : action
            ? '2px solid transparent'
            : '2px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Map name */}
      <div
        className={`relative z-10 w-full py-2 text-center text-xs font-bold uppercase tracking-wider ${
          isBanned ? 'text-overlay-text-muted' : 'text-overlay-text-primary'
        }`}
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        }}
      >
        {mapName}
      </div>

      {/* Ban overlay */}
      <AnimatePresence>
        {isBanned && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={SPRING_SNAPPY}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ backgroundColor: 'var(--overlay-ban-bg)', backdropFilter: 'grayscale(1)' }}
          >
            <span className="text-2xl font-black text-overlay-ban">X</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-overlay-ban/75">
              BANNED
            </span>
            <span className="mt-0.5 text-[9px] text-overlay-ban/50">
              Team {action.team}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pick overlay */}
      <AnimatePresence>
        {isPicked && action && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={SPRING_SNAPPY}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ backgroundColor: 'var(--overlay-pick-bg)' }}
          >
            <span className="text-lg font-black text-overlay-pick">PICK</span>
            <span className="mt-0.5 text-[9px] font-semibold text-overlay-pick/80">
              Team {action.team}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decider overlay */}
      <AnimatePresence>
        {isDecider && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={SPRING_SNAPPY}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-yellow-900/50"
          >
            <span className="text-lg font-black text-yellow-300">DECIDER</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default function BPOverlay() {
  const session = useBPStore((s) => s.session);
  const visible = useOverlayStore((s) => s.states.bp.visible);
  const opacity = useOverlayStore((s) => s.states.bp.opacity);

  const show = visible && !!session;

  const usedMaps = session ? new Set(session.actions.map((a) => a.map)) : new Set<string>();
  const isCompleted = session?.status === 'completed';
  const deciderMap = isCompleted
    ? session?.mapPool.find((m) => !usedMaps.has(m)) ?? null
    : null;

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
          {/* Background dim */}
          <div className="absolute inset-0 bg-overlay-bg-secondary" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-overlay-text-primary">
                MAP VETO
              </h1>
              <span className="rounded bg-overlay-text-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-overlay-text-secondary">
                {session.format}
              </span>
            </div>

            {/* Map grid */}
            <div className="flex gap-3">
              {session.mapPool.map((mapName, index) => {
                const action = session.actions.find((a) => a.map === mapName);
                const isDeciderMap = deciderMap === mapName;
                return (
                  <MapCard
                    key={mapName}
                    mapName={mapName}
                    action={action}
                    isDecider={isDeciderMap}
                    index={index}
                  />
                );
              })}
            </div>

            {/* Active indicator */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-full bg-overlay-text-primary/10 px-6 py-2 backdrop-blur-sm"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm font-semibold uppercase tracking-wider text-overlay-text-primary">
                  Team {session.activeTeam} &mdash;{' '}
                  {session.currentPhase === 'ban' ? 'BAN' : 'PICK'}
                </span>
              </motion.div>
            )}

            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
