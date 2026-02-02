'use client';

import dynamic from 'next/dynamic';

const BPOverlay = dynamic(() => import('@/components/overlays/BPOverlay'), { ssr: false });

export default function BPPage() {
  return <BPOverlay />;
}
