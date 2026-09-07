'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Winery, experienceLabels } from '@/lib/data';
import { money } from '@/lib/quote';
const pin = (selected: boolean) =>
  L.divIcon({
    className: 'winery-marker',
    html: `<div class="map-pin ${selected ? 'selected' : ''}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3h8l1 6a5 5 0 0 1-10 0l1-6ZM12 14v7m-4 0h8M7 8h10"/></svg></div>`,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
  });
function MapBounds({ wineries }: { wineries: Winery[] }) {
  const map = useMap();
  const positions = JSON.stringify(wineries.map((w) => [w.lat, w.lng]));
  useEffect(() => {
    const points = JSON.parse(positions) as [number, number][];
    if (points.length) map.fitBounds(points, { padding: [35, 35], maxZoom: 12, animate: false });
  }, [map, positions]);
  return null;
}
export default function WineryMap({
  wineries,
  selected,
  toggle,
}: {
  wineries: Winery[];
  selected: number[];
  toggle: (id: number) => void;
}) {
  return (
    <MapContainer center={[-33.1, -68.9]} zoom={9} scrollWheelZoom={false} className="winery-map">
      <MapBounds wineries={wineries} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {wineries.map((w) => (
        <Marker
          key={w.id}
          title={w.name}
          alt={w.name}
          position={[w.lat, w.lng]}
          icon={pin(selected.includes(w.id))}
        >
          <Popup>
            <strong>{w.name}</strong>
            <p>
              {experienceLabels[w.experience]}
              <br />
              {money(w.price)} por persona
            </p>
            <button className="popup-button" onClick={() => toggle(w.id)}>
              {selected.includes(w.id) ? 'Quitar del día' : 'Agregar a este día'}
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
