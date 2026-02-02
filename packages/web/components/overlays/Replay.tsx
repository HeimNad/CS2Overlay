'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { SPRING_SMOOTH } from '@/lib/animations';

export default function Replay() {
  const visible = useOverlayStore((s) => s.states.replay.visible);
  const opacity = useOverlayStore((s) => s.states.replay.opacity);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={SPRING_SMOOTH}
          style={{ opacity }}
          className="absolute right-8 top-8"
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 rounded-lg bg-overlay-live/90 px-5 py-2.5 shadow-lg shadow-overlay-live/40 backdrop-blur-sm"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-overlay-text-primary" />
            <span className="text-lg font-black uppercase tracking-[0.2em] text-overlay-text-primary">
              REPLAY
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
