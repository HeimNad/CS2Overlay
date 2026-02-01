'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';

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
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ opacity }}
          className="absolute right-8 top-8"
        >
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 rounded-lg bg-red-600/90 px-5 py-2.5 shadow-lg shadow-red-900/40 backdrop-blur-sm"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
            <span className="text-lg font-black uppercase tracking-[0.2em] text-white">
              REPLAY
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
