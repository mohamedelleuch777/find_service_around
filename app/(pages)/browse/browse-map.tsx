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
};

const DEFAULT_ZOOM = 8;
let leafletSingleton: any = null;
let markerIconSingleton: any = null;

function getLeaflet() {
  if (leafletSingleton) return leafletSingleton;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require('leaflet');
  markerIconSingleton = L.divIcon({
    className: 'browse-map-pin',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  leafletSingleton = L;
  return L;
}

export default function BrowseMap({ center, markers, onMarkerClick }: Props) {
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
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
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="browse-map" />;
}
