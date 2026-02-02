'use client';

import { useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { useThemeStore } from '@/stores/themeStore';

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connect = useSocketStore((s) => s.connect);
  const currentTheme = useThemeStore((s) => s.currentTheme);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div
      data-overlay-theme={currentTheme === 'default-dark' ? undefined : currentTheme}
      style={{
        width: 1920,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {children}
    </div>
  );
}
