'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Issue } from '@/types';
import { URGENCY_CONFIG } from '@/constants';

// Fix for default marker icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface CommunityMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
}

export default function CommunityMap({ issues, center = [12.9716, 77.5946], zoom = 12 }: CommunityMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 10 }}>
      {/* Esri Satellite Map */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
      />
      {/* Esri Labels */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution=""
      />

      {issues.filter(i => i.location && i.location.coordinates).map(issue => (
        <Marker
          key={issue.id}
          position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
          icon={createCustomIcon(URGENCY_CONFIG[issue.urgency]?.color || '#3B82F6')}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-gray-900">{issue.title}</h3>
              <p className="text-sm text-gray-600 mb-2 capitalize">{issue.category.replace('_', ' ')}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{issue.status}</span>
                <span style={{ color: URGENCY_CONFIG[issue.urgency]?.color }} className="font-bold uppercase">
                  {issue.urgency}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
