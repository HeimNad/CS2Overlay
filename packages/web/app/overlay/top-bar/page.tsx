'use client';

import dynamic from 'next/dynamic';

const TopBar = dynamic(() => import('@/components/overlays/TopBar'), { ssr: false });

export default function TopBarPage() {
  return <TopBar />;
}
