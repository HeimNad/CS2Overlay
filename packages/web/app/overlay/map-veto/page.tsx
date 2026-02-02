'use client';

import dynamic from 'next/dynamic';

const MapVeto = dynamic(() => import('@/components/overlays/MapVeto'), { ssr: false });

export default function MapVetoPage() {
  return <MapVeto />;
}
