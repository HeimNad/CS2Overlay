'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMatchStore } from '@/stores/matchStore';
import { useOverlayStore } from '@/stores/overlayStore';
import { SPRING_SMOOTH, SPRING_SNAPPY } from '@/lib/animations';

const SeriesDots = React.memo(function SeriesDots({ format, scoreA, scoreB }: { format: string; scoreA: number; scoreB: number }) {
  const total = format === 'BO1' ? 1 : format === 'BO3' ? 2 : 3;
  return (
    <div className="flex items-center gap-1">
      {/* Team A dots */}
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={`a-${i}`}
            className={`h-1.5 w-1.5 rounded-full ${
              i < scoreA ? 'bg-overlay-text-primary' : 'bg-overlay-text-primary/25'
            }`}
          />
        ))}
      </div>
      <span className="mx-1 text-[10px] text-overlay-text-muted">{format}</span>
      {/* Team B dots */}
      <div className="flex gap-0.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={`b-${i}`}
            className={`h-1.5 w-1.5 rounded-full ${
              i < scoreB ? 'bg-overlay-text-primary' : 'bg-overlay-text-primary/25'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

const TeamDisplay = React.memo(function TeamDisplay({
  name,
  score,
  side,
}: {
  name: string;
  score: number;
  side: 'left' | 'right';
}) {
  const isLeft = side === 'left';
  return (
    <div
      className={`flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Logo placeholder */}
      <div className="flex h-12 w-12 items-center justify-center rounded bg-overlay-text-primary/10 text-xs text-overlay-text-muted">
        LOGO
      </div>
      {/* Name */}
      <span className="min-w-[80px] text-center text-sm font-bold uppercase tracking-wider text-overlay-text-primary">
        {name}
      </span>
      {/* Score with scale pulse on change */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={score}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={SPRING_SNAPPY}
          className="min-w-[40px] text-center font-mono text-3xl font-black tabular-nums text-overlay-text-primary"
        >
          {score}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});

export default function Scoreboard() {
  const match = useMatchStore((s) => s.currentMatch);
  const visible = useOverlayStore((s) => s.states.scoreboard.visible);
  const opacity = useOverlayStore((s) => s.states.scoreboard.opacity);

  const show = visible && !!match;

  return (
    <AnimatePresence>
      {show && match && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={SPRING_SMOOTH}
          style={{ opacity }}
          className="absolute left-1/2 top-8 -translate-x-1/2"
        >
          <div className="flex items-center gap-0 rounded-lg border border-overlay-border-subtle bg-overlay-bg-primary shadow-2xl shadow-overlay-shadow backdrop-blur-md">
            {/* Team A */}
            <div className="px-6 py-3">
              <TeamDisplay
                name={match.teamA.shortName || match.teamA.name}
                score={match.teamA.score}
                side="left"
              />
            </div>

            {/* Center divider + info */}
            <div className="flex flex-col items-center justify-center border-x border-overlay-border px-5 py-2">
              <SeriesDots
                format={match.format}
                scoreA={match.teamA.score}
                scoreB={match.teamB.score}
              />
              <span className="mt-1 text-[10px] uppercase tracking-widest text-overlay-text-muted">
                {match.status === 'live' ? 'LIVE' : match.status === 'finished' ? 'FINAL' : 'UPCOMING'}
              </span>
            </div>

            {/* Team B */}
            <div className="px-6 py-3">
              <TeamDisplay
                name={match.teamB.shortName || match.teamB.name}
                score={match.teamB.score}
                side="right"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
