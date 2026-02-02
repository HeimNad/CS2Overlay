'use client';

import dynamic from 'next/dynamic';

const Sponsor = dynamic(() => import('@/components/overlays/Sponsor'), { ssr: false });

export default function SponsorPage() {
  return <Sponsor />;
}
