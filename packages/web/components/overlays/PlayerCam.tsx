'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';

export default function PlayerCam() {
  const visible = useOverlayStore((s) => s.states.playerCam.visible);
  const opacity = useOverlayStore((s) => s.states.playerCam.opacity);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ opacity }}
          className="absolute bottom-24 left-8"
        >
          {/* Camera frame decoration */}
          <div className="relative h-[200px] w-[280px]">
            {/* Corner decorations */}
            <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-white/60" />
            <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-white/60" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white/60" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-white/60" />

            {/* Inner border */}
            <div className="absolute inset-1 border border-white/10 rounded" />

            {/* Name plate at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
              <div className="rounded-t bg-black/80 px-4 py-1 backdrop-blur-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Player
                </span>
                <span className="ml-2 text-[10px] font-semibold text-white/40">
                  TEAM
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
