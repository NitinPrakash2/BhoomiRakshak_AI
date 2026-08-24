import { useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import { riskColor } from "../components/RiskBadge";

// NER overview center (Section 11: OSM-compatible basemap).
const NER_CENTER = [25.5, 91.5];
const DEFAULT_ZOOM = 7;

/**
 * GIS Risk Map (MASTER_DOCUMENTATION.md Sections 11 & 12).
 * Renders real risk zones from GET /api/risk/zones as GeoJSON polygons,
 * coloured by the product risk thresholds. Clicking a polygon selects a zone.
 */
export default function RiskMap({ zones = [], onSelectZone, height = 420 }) {
  const polygons = useMemo(
    () =>
      zones
        .filter((z) => z.geometry?.type === "Polygon" && Array.isArray(z.geometry.coordinates?.[0]))
        .map((z) => ({
          id: z.id,
          name: z.name,
          district: z.district,
          state: z.state,
          riskScore: z.riskScore,
          riskLevel: z.riskLevel,
          dataQuality: z.dataQuality,
          positions: z.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]),
        })),
    [zones]
  );

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-700">
      <MapContainer center={NER_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polygons.map((p) => (
          <Polygon
            key={p.id}
            positions={p.positions}
            pathOptions={{
              color: riskColor(p.riskLevel),
              weight: 1,
              fillOpacity: 0.45,
            }}
            eventHandlers={onSelectZone ? { click: () => onSelectZone(p.id) } : undefined}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <div className="font-semibold">{p.name}</div>
                <div>{p.district}, {p.state}</div>
                <div>
                  {p.riskScore != null ? `${p.riskScore}/100` : "—"} ·{" "}
                  {(p.riskLevel || "").replace("_", " ")}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}