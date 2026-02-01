'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { socketService } from '@/lib/socket';
import type { OverlayName } from '@/types';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/match-control', label: 'Match Control' },
  { href: '/admin/bp-control', label: 'BP Control' },
  { href: '/admin/scenes', label: 'Scenes' },
  { href: '/admin/overlay-toggle', label: 'Overlay Toggle' },
  { href: '/admin/gsi', label: 'GSI Monitor' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const connect = useSocketStore((s) => s.connect);
  const connectionState = useSocketStore((s) => s.connectionState);

  useEffect(() => {
    connect();
  }, [connect]);

  // Listen for Electron shortcut actions
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI) return;

    const cleanup = window.electronAPI.onShortcut((action: string) => {
      if (action.startsWith('toggle:')) {
        const overlayName = action.replace('toggle:', '') as OverlayName;
        // We need to read current state; import the store inline to avoid circular deps
        import('@/stores/overlayStore').then(({ useOverlayStore }) => {
          const current = useOverlayStore.getState().states[overlayName]?.visible ?? false;
          socketService.emit('overlay:toggle', { name: overlayName, visible: !current });
        });
      }
    });

    return cleanup;
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-60 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold">CS2 Overlay</h1>
          <p className="text-xs text-zinc-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-700 text-white font-medium'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800 text-xs">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              connectionState === 'connected'
                ? 'bg-green-500'
                : connectionState === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          {connectionState === 'connected'
            ? 'Server Connected'
            : connectionState === 'connecting'
              ? 'Connecting...'
              : 'Disconnected'}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
