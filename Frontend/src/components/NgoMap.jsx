import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EmptyState } from "./ui.jsx";

// NGOs that share a city would sit on top of each other, so spread them out slightly.
function spread(ngos) {
  const seen = {};
  return ngos
    .filter((n) => Number.isFinite(n.lat) && Number.isFinite(n.lng))
    .map((n) => {
      const key = `${n.lat},${n.lng}`;
      const k = (seen[key] = (seen[key] ?? -1) + 1);
      if (k === 0) return { ...n, pos: [n.lat, n.lng] };
      const angle = (k * 70 * Math.PI) / 180;
      return { ...n, pos: [n.lat + 0.5 * Math.sin(angle), n.lng + 0.5 * Math.cos(angle)] };
    });
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 7);
    else map.fitBounds(points, { padding: [30, 30], maxZoom: 8 });
  }, [map, points]);
  return null;
}

export default function NgoMap({ ngos, selectedId, onSelect }) {
  const markers = spread(ngos);
  const signature = markers.map((m) => m.id).join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const points = useMemo(() => markers.map((m) => m.pos), [signature]);

  if (markers.length === 0) {
    return <EmptyState title="No location data" text="None of the NGOs shown has a map position yet. Admins can add cities with coordinates." />;
  }

  return (
    <div className="map-box">
      <MapContainer center={[22.5, 79]} zoom={4} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={points} />
        {markers.map((m) => {
          const verified = m.verification.startsWith("Verified");
          const selected = m.id === selectedId;
          return (
            <CircleMarker
              key={m.id}
              center={m.pos}
              radius={selected ? 13 : 9}
              pathOptions={{ color: "#fff", weight: 2, fillColor: verified ? "#1f6b47" : "#c58a1b", fillOpacity: 0.95 }}
              eventHandlers={{ click: () => onSelect?.(m.id) }}
            >
              <Popup>
                <strong>{m.name}</strong>
                <br />
                {m.cities.join(", ") || "Location not listed"}
                <br />
                <small>Approximate position (demo)</small>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
