'use client';

import dynamic from 'next/dynamic';

const Countdown = dynamic(() => import('@/components/overlays/Countdown'), { ssr: false });

export default function CountdownPage() {
  return <Countdown />;
}
