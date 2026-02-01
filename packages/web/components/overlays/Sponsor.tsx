'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';

export default function Sponsor() {
  const visible = useOverlayStore((s) => s.states.sponsor.visible);
  const opacity = useOverlayStore((s) => s.states.sponsor.opacity);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ opacity }}
          className="absolute bottom-0 left-0 right-0 flex justify-center"
        >
          <div className="flex items-center gap-4 rounded-t-lg bg-black/75 px-8 py-2.5 backdrop-blur-sm">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Sponsored by
            </span>
            <div className="h-3 w-px bg-white/20" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">
              Sponsor Name
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
