'use client';

import dynamic from 'next/dynamic';

const Replay = dynamic(() => import('@/components/overlays/Replay'), { ssr: false });

export default function ReplayPage() {
  return <Replay />;
}
