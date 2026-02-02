'use client';

import { useRef, useCallback } from 'react';
import { useOverlayStore } from '@/stores/overlayStore';
import { socketService } from '@/lib/socket';
import type { OverlayName } from '@/types';

const OVERLAY_LIST: { name: OverlayName; label: string }[] = [
  { name: 'scoreboard', label: 'Scoreboard' },
  { name: 'bp', label: 'Ban/Pick' },
  { name: 'lowerThird', label: 'Lower Third' },
  { name: 'topBar', label: 'Top Bar' },
  { name: 'mapVeto', label: 'Map Veto' },
  { name: 'countdown', label: 'Countdown' },
  { name: 'replay', label: 'Replay' },
  { name: 'break', label: 'Break' },
  { name: 'sponsor', label: 'Sponsor' },
  { name: 'playerCam', label: 'Player Cam' },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function OverlayToggle() {
  const overlayStates = useOverlayStore((s) => s.states);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleToggle = (name: OverlayName, visible: boolean) => {
    socketService.emit('overlay:toggle', { name, visible });
  };

  const handleOpacity = useCallback((name: OverlayName, opacity: number) => {
    if (debounceTimers.current[name]) {
      clearTimeout(debounceTimers.current[name]);
    }
    debounceTimers.current[name] = setTimeout(() => {
      socketService.emit('overlay:setOpacity', { name, opacity });
      delete debounceTimers.current[name];
    }, 100);
  }, []);

  const handleShowAll = () => {
    for (const item of OVERLAY_LIST) {
      socketService.emit('overlay:toggle', { name: item.name, visible: true });
    }
  };

  const handleHideAll = () => {
    for (const item of OVERLAY_LIST) {
      socketService.emit('overlay:toggle', { name: item.name, visible: false });
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Overlay Toggle</h2>

      {/* Bulk actions */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleShowAll}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Show All
        </button>
        <button
          onClick={handleHideAll}
          className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          Hide All
        </button>
      </div>

      {/* Overlay list */}
      <div className="space-y-2">
        {OVERLAY_LIST.map(({ name, label }) => {
          const state = overlayStates[name];
          return (
            <div
              key={name}
              className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              {/* Status dot */}
              <div
                className={`h-2 w-2 rounded-full ${state.visible ? 'bg-green-500' : 'bg-zinc-600'}`}
              />

              {/* Label */}
              <span className="w-28 text-sm font-medium text-zinc-200">{label}</span>

              {/* Toggle */}
              <ToggleSwitch
                checked={state.visible}
                onChange={(v) => handleToggle(name, v)}
              />

              {/* Opacity slider */}
              <div className="flex flex-1 items-center gap-3">
                <span className="text-xs text-zinc-500">Opacity</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(state.opacity * 100)}
                  onChange={(e) => handleOpacity(name, Number(e.target.value) / 100)}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-blue-500"
                />
                <span className="w-10 text-right text-xs tabular-nums text-zinc-400">
                  {Math.round(state.opacity * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
