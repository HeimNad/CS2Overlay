'use client';

import dynamic from 'next/dynamic';

const Break = dynamic(() => import('@/components/overlays/Break'), { ssr: false });

export default function BreakPage() {
  return <Break />;
}
