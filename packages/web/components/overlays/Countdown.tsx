'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { useGSIStore } from '@/stores/gsiStore';

export default function Countdown() {
  const visible = useOverlayStore((s) => s.states.countdown.visible);
  const opacity = useOverlayStore((s) => s.states.countdown.opacity);
  const gsiState = useGSIStore((s) => s.gsiState);

  const countdown = gsiState.isConnected && gsiState.phaseCountdown
    ? gsiState.phaseCountdown.endsIn
    : null;

  const phase = gsiState.isConnected && gsiState.phaseCountdown
    ? gsiState.phaseCountdown.phase
    : null;

  // Show when visible, even without GSI data (static display)
  const show = visible;

  // Format countdown value
  const displayTime = countdown
    ? parseFloat(countdown) > 0
      ? Math.ceil(parseFloat(countdown)).toString()
      : '0'
    : '--';

  const phaseLabel = phase === 'freezetime'
    ? 'ROUND STARTS IN'
    : phase === 'warmup'
      ? 'MATCH STARTS IN'
      : phase === 'bomb'
        ? 'BOMB PLANTED'
        : 'MATCH STARTS IN';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.span
              className="text-sm font-bold uppercase tracking-[0.4em] text-white/60"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {phaseLabel}
            </motion.span>

            <AnimatePresence mode="popLayout">
              <motion.span
                key={displayTime}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-[120px] font-black leading-none tabular-nums text-white"
                style={{ textShadow: '0 0 40px rgba(255,255,255,0.3)' }}
              >
                {displayTime}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
