'use client';

import dynamic from 'next/dynamic';
import { Issue } from '@/types';

const CommunityMap = dynamic(() => import('./CommunityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading Community Map...</p>
      </div>
    </div>
  ),
});

interface DynamicMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <CommunityMap {...props} />;
}
