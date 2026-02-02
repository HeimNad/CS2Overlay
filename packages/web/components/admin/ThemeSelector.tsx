'use client';

import { useThemeStore, THEME_PRESETS } from '@/stores/themeStore';
import { socketService } from '@/lib/socket';
import type { OverlayThemeId } from '@/stores/themeStore';

export default function ThemeSelector() {
  const currentTheme = useThemeStore((s) => s.currentTheme);

  const handleSelect = (themeId: OverlayThemeId) => {
    socketService.emit('overlay:setTheme', { theme: themeId });
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Overlay Theme</h2>
      <div className="grid grid-cols-5 gap-3">
        {THEME_PRESETS.map((preset) => {
          const isActive = currentTheme === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`flex flex-col items-center gap-2 rounded-lg border px-3 py-4 transition-colors ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <div
                className="h-8 w-8 rounded-full border border-zinc-600"
                style={{ backgroundColor: preset.previewColor }}
              />
              <span className={`text-xs font-semibold ${isActive ? 'text-blue-400' : 'text-zinc-300'}`}>
                {preset.name}
              </span>
              <span className="text-[10px] text-zinc-500">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
