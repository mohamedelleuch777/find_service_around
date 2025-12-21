'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import './browse-map.css';

type Marker = {
  id: string;
  lat: number;
  lon: number;
  label: string;
  category?: string;
  job?: string;
};

type Props = {
  center: { lat: number; lon: number };
  markers: Marker[];
  onMarkerClick?: (marker: Marker) => void;
  radiusKm?: number;
  showUserMarker?: boolean;
  userName?: string;
};

const DEFAULT_ZOOM = 11;
let leafletSingleton: any = null;
let markerIconSingleton: any = null;
let userHomeIconSingleton: any = null;
let jobIconSingleton: any = null;

function getLeaflet() {
  if (leafletSingleton) return leafletSingleton;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require('leaflet');
  markerIconSingleton = L.divIcon({
    html: `<i class="fa-solid fa-location-dot" style="color: #0f172a; font-size: 22px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); display: block; width: 22px; height: 22px; line-height: 22px; text-align: center;"></i>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -16],
    className: '',
  });
  userHomeIconSingleton = L.divIcon({
    html: `<i class="fa-solid fa-house" style="color: #1e40af; font-size: 30px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); display: block; width: 30px; height: 30px; line-height: 30px; text-align: center;"></i>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: '',
  });
  jobIconSingleton = L.divIcon({
    html: `<i class="fa-solid fa-briefcase" style="color: #dc2626; font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); display: block; width: 24px; height: 24px; line-height: 24px; text-align: center;"></i>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
    className: '',
  });
  leafletSingleton = L;
  return L;
}

export default function BrowseMap({ center, markers, onMarkerClick, radiusKm, showUserMarker = true, userName }: Props) {
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const radiusRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const providerCirclesRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clickRef = useRef(onMarkerClick);

  useEffect(() => {
    clickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = getLeaflet();
    if (!mapRef.current && containerRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [center.lat, center.lon],
        zoom: DEFAULT_ZOOM,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
  }, [center.lat, center.lon]);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = getLeaflet();
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
    } else {
      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lon], markerIconSingleton ? { icon: markerIconSingleton } : undefined);
      marker.bindPopup(
        `<div style="font-weight:700">${m.label}</div><div style="color:#475569">${m.job || ''}</div><div style="color:#94a3b8">${m.category || ''}</div>`
      );
      if (clickRef.current) {
        marker.on('click', () => clickRef.current?.(m));
      }
      marker.addTo(markerLayerRef.current);
    });
  }, [markers]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.lat, center.lon], mapRef.current.getZoom() || DEFAULT_ZOOM);
  }, [center.lat, center.lon]);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = getLeaflet();
    if (radiusRef.current) {
      radiusRef.current.remove();
      radiusRef.current = null;
    }
    if (centerMarkerRef.current) {
      centerMarkerRef.current.remove();
      centerMarkerRef.current = null;
    }
    // Remove all existing provider circles
    providerCirclesRef.current.forEach((circle) => circle.remove());
    providerCirclesRef.current = [];
    
    // Only show a house icon at user's location if user location has loaded
    if (showUserMarker) {
      centerMarkerRef.current = L.marker([center.lat, center.lon], { 
        icon: userHomeIconSingleton 
      }).addTo(mapRef.current);
      
      const userPopupContent = `<div style="font-weight:700; color: #0f172a;"><i class="fa-solid fa-house" style="margin-right: 6px;"></i>Your Location</div><div style="color: #475569; margin-top: 4px;">${userName || 'Your home'}</div>`;
      centerMarkerRef.current.bindPopup(userPopupContent);
    }
    
    // Show job icon for each provider's location
    markers.forEach((marker) => {
      const jobMarker = L.marker([marker.lat, marker.lon], { 
        icon: jobIconSingleton 
      }).addTo(mapRef.current);
      
      const providerPopupContent = `<div style="font-weight:700; color: #0f172a;">${marker.label}</div><div style="color: #475569; margin-top: 4px;">${marker.job || 'Service'}</div><div style="color: #94a3b8; margin-top: 2px;">${marker.category || ''}</div>`;
      jobMarker.bindPopup(providerPopupContent);
      
      jobMarker.on('click', () => {
        if (clickRef.current) clickRef.current(marker);
      });
      
      providerCirclesRef.current.push(jobMarker);
    });
    
    // Show radius circle if distance filter is active
    if (radiusKm !== undefined && radiusKm > 0) {
      radiusRef.current = L.circle([center.lat, center.lon], {
        radius: radiusKm * 1000,
        color: '#0f172a',
        weight: 1,
        opacity: 0.4,
        fillColor: '#0f172a',
        fillOpacity: 0.12,
      }).addTo(mapRef.current);
    }
  }, [center.lat, center.lon, radiusKm ?? 0, markers, showUserMarker, userName]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="browse-map" />;
}
