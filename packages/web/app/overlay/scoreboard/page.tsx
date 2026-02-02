'use client';

import dynamic from 'next/dynamic';

const Scoreboard = dynamic(() => import('@/components/overlays/Scoreboard'), { ssr: false });

export default function ScoreboardPage() {
  return <Scoreboard />;
}
