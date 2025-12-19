'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import './profile-map.css';

type Props = {
  latitude?: number | '';
  longitude?: number | '';
  viewLat?: number | null;
  viewLon?: number | null;
  onSelect: (lat: number, lon: number) => void;
};

const DEFAULT_CENTER: [number, number] = [33.8869, 9.5375];
let leafletSingleton: any = null;
let markerIconSingleton: any = null;

function getLeaflet() {
  if (leafletSingleton) return leafletSingleton;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L = require('leaflet');
  markerIconSingleton = L.divIcon({
    className: 'profile-map-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  leafletSingleton = L;
  return L;
}

export default function ProfileMap({ latitude, longitude, viewLat, viewLon, onSelect }: Props) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = getLeaflet();

    if (!mapRef.current && containerRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: viewLat && viewLon ? [viewLat, viewLon] : latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER,
        zoom: 10,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      mapRef.current.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        if (!mapRef.current) return;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          markerRef.current = L.marker([lat, lon], markerIconSingleton ? { icon: markerIconSingleton } : undefined).addTo(mapRef.current);
        }
        onSelectRef.current(lat, lon);
      });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = getLeaflet();
    if (latitude !== undefined && latitude !== '' && longitude !== undefined && longitude !== '') {
      if (markerRef.current) {
        markerRef.current.setLatLng([Number(latitude), Number(longitude)]);
      } else {
        markerRef.current = L.marker(
          [Number(latitude), Number(longitude)],
          markerIconSingleton ? { icon: markerIconSingleton } : undefined
        ).addTo(mapRef.current);
      }
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (viewLat && viewLon) {
      mapRef.current.setView([viewLat, viewLon], mapRef.current.getZoom() || 11);
    }
  }, [viewLat, viewLon]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="profile-map" />;
}
