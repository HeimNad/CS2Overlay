'use client';

import { useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connect = useSocketStore((s) => s.connect);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div
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
