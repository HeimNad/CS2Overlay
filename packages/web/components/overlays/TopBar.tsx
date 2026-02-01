'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { useMatchStore } from '@/stores/matchStore';
import { useGSIStore } from '@/stores/gsiStore';

export default function TopBar() {
  const visible = useOverlayStore((s) => s.states.topBar.visible);
  const opacity = useOverlayStore((s) => s.states.topBar.opacity);
  const match = useMatchStore((s) => s.currentMatch);
  const gsiState = useGSIStore((s) => s.gsiState);

  const show = visible && !!match;

  const isLive = match?.status === 'live';
  const mapNumber = gsiState.isConnected && gsiState.mapName
    ? `MAP: ${gsiState.mapName.replace('de_', '').toUpperCase()}`
    : match
      ? `MAP ${match.currentMap + 1}`
      : '';

  return (
    <AnimatePresence>
      {show && match && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          style={{ opacity }}
          className="absolute left-1/2 top-0 -translate-x-1/2"
        >
          <div className="flex items-center rounded-b-lg bg-black/80 shadow-lg shadow-black/30 backdrop-blur-sm">
            {/* Event name */}
            <div className="border-r border-white/10 px-5 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                CS2 Tournament
              </span>
            </div>

            {/* Format */}
            <div className="border-r border-white/10 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {match.format}
              </span>
            </div>

            {/* Map info */}
            {mapNumber && (
              <div className="border-r border-white/10 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {mapNumber}
                </span>
              </div>
            )}

            {/* Live status */}
            <div className="px-4 py-2">
              {isLive ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-400">
                    LIVE
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {match.status === 'finished' ? 'FINISHED' : 'UPCOMING'}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
