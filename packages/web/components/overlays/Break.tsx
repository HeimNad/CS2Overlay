'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { useGSIStore } from '@/stores/gsiStore';
import { FADE, SPRING_GENTLE } from '@/lib/animations';

export default function Break() {
  const visible = useOverlayStore((s) => s.states.break.visible);
  const opacity = useOverlayStore((s) => s.states.break.opacity);
  const gsiState = useGSIStore((s) => s.gsiState);

  // Determine break type from GSI phase
  const isIntermission = gsiState.isConnected && gsiState.mapPhase === 'intermission';
  const breakText = isIntermission ? 'HALF TIME' : 'TECHNICAL PAUSE';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 bg-overlay-bg-primary/90" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, ...SPRING_GENTLE }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-px w-40 bg-gradient-to-r from-transparent via-overlay-text-primary/30 to-transparent" />
              <span className="text-2xl font-black uppercase tracking-[0.4em] text-overlay-text-primary/90">
                {breakText}
              </span>
              <div className="h-px w-40 bg-gradient-to-r from-transparent via-overlay-text-primary/30 to-transparent" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ delay: 0.5, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-xs uppercase tracking-[0.3em] text-overlay-text-muted"
            >
              Please stand by
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
