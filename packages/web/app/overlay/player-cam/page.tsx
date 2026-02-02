'use client';

import dynamic from 'next/dynamic';

const PlayerCam = dynamic(() => import('@/components/overlays/PlayerCam'), { ssr: false });

export default function PlayerCamPage() {
  return <PlayerCam />;
}
