'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOverlayStore } from '@/stores/overlayStore';
import { useMatchStore } from '@/stores/matchStore';
import { useGSIStore } from '@/stores/gsiStore';
import { SPRING_SMOOTH } from '@/lib/animations';

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
          transition={SPRING_SMOOTH}
          style={{ opacity }}
          className="absolute left-1/2 top-0 -translate-x-1/2"
        >
          <div className="flex items-center rounded-b-lg border-b border-overlay-border-subtle bg-overlay-bg-primary shadow-lg shadow-overlay-shadow backdrop-blur-sm">
            {/* Event name */}
            <div className="border-r border-overlay-border px-5 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-overlay-text-secondary">
                CS2 Tournament
              </span>
            </div>

            {/* Format */}
            <div className="border-r border-overlay-border px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-overlay-text-muted">
                {match.format}
              </span>
            </div>

            {/* Map info */}
            {mapNumber && (
              <div className="border-r border-overlay-border px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-overlay-text-muted">
                  {mapNumber}
                </span>
              </div>
            )}

            {/* Live status */}
            <div className="px-4 py-2">
              {isLive ? (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-overlay-live" />
                  <span className="text-xs font-black uppercase tracking-wider text-overlay-live">
                    LIVE
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-overlay-text-muted">
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
