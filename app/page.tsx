import Link from 'next/link';

const overlayRoutes = [
  { href: '/overlay/scoreboard', label: 'Scoreboard' },
  { href: '/overlay/bp', label: 'Ban/Pick' },
  { href: '/overlay/lower-third', label: 'Lower Third' },
  { href: '/overlay/top-bar', label: 'Top Bar' },
  { href: '/overlay/map-veto', label: 'Map Veto' },
  { href: '/overlay/countdown', label: 'Countdown' },
  { href: '/overlay/replay', label: 'Replay' },
  { href: '/overlay/break', label: 'Break' },
  { href: '/overlay/sponsor', label: 'Sponsor' },
  { href: '/overlay/player-cam', label: 'Player Cam' },
];

const adminRoutes = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/match-control', label: 'Match Control' },
  { href: '/admin/bp-control', label: 'BP Control' },
  { href: '/admin/scenes', label: 'Scenes' },
  { href: '/admin/overlay-toggle', label: 'Overlay Toggle' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">CS2 Overlay System</h1>
        <p className="text-zinc-500 mb-8">
          Esports broadcast overlay system for live streaming with OBS Studio
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-zinc-300">
            Admin Panel
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {adminRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors"
              >
                <span className="font-medium">{route.label}</span>
                <span className="block text-xs text-zinc-600 mt-1">
                  {route.href}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-zinc-300">
            Overlay Pages
          </h2>
          <p className="text-sm text-zinc-600 mb-3">
            Use these URLs as OBS Browser Sources (1920x1080, transparent background)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {overlayRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors"
              >
                <span className="font-medium">{route.label}</span>
                <span className="block text-xs text-zinc-600 mt-1">
                  {route.href}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
