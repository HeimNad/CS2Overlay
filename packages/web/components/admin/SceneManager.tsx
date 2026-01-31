'use client';

import { useOverlayStore } from '@/stores/overlayStore';
import { socketService } from '@/lib/socket';
import { SCENE_PRESETS, type ScenePreset } from '@/lib/scenePresets';
import type { OverlayName } from '@/types';

const OVERLAY_LABELS: Record<OverlayName, string> = {
  scoreboard: 'Scoreboard',
  bp: 'Ban/Pick',
  lowerThird: 'Lower Third',
  topBar: 'Top Bar',
  mapVeto: 'Map Veto',
  countdown: 'Countdown',
  replay: 'Replay',
  break: 'Break',
  sponsor: 'Sponsor',
  playerCam: 'Player Cam',
};

function getActiveScene(overlayStates: Record<OverlayName, { visible: boolean }>): string | null {
  for (const preset of SCENE_PRESETS) {
    const match = (Object.keys(preset.overlays) as OverlayName[]).every(
      (name) => preset.overlays[name] === overlayStates[name].visible
    );
    if (match) return preset.id;
  }
  return null;
}

function SceneCard({
  preset,
  isActive,
  onApply,
}: {
  preset: ScenePreset;
  isActive: boolean;
  onApply: () => void;
}) {
  const enabledOverlays = (Object.keys(preset.overlays) as OverlayName[]).filter(
    (name) => preset.overlays[name]
  );

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isActive
          ? 'border-blue-500 bg-blue-950/30'
          : 'border-zinc-800 bg-zinc-900'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">{preset.name}</h3>
        {isActive && (
          <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Active
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-zinc-500">{preset.description}</p>

      {/* Overlay badges */}
      <div className="mb-4 flex flex-wrap gap-1">
        {enabledOverlays.length > 0 ? (
          enabledOverlays.map((name) => (
            <span
              key={name}
              className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
            >
              {OVERLAY_LABELS[name]}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-zinc-600">No overlays</span>
        )}
      </div>

      <button
        onClick={onApply}
        disabled={isActive}
        className={`w-full rounded py-1.5 text-sm font-semibold transition-colors ${
          isActive
            ? 'cursor-default bg-blue-600/20 text-blue-400'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {isActive ? 'Applied' : 'Apply'}
      </button>
    </div>
  );
}

export default function SceneManager() {
  const overlayStates = useOverlayStore((s) => s.states);
  const activeSceneId = getActiveScene(overlayStates);

  const handleApply = (preset: ScenePreset) => {
    socketService.emit('overlay:applyScene', { overlays: preset.overlays });
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Scenes</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {SCENE_PRESETS.map((preset) => (
          <SceneCard
            key={preset.id}
            preset={preset}
            isActive={activeSceneId === preset.id}
            onApply={() => handleApply(preset)}
          />
        ))}
      </div>
    </div>
  );
}
