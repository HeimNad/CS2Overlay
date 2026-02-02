'use client';

import dynamic from 'next/dynamic';

const LowerThird = dynamic(() => import('@/components/overlays/LowerThird'), { ssr: false });

export default function LowerThirdPage() {
  return <LowerThird />;
}
