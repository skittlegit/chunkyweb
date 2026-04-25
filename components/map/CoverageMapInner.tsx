"use client";

import { useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import { useCases } from "@/hooks/useCases";
import { useEphemeris } from "@/hooks/useEphemeris";
import { useAppStore } from "@/store/useAppStore";
import { useTimelineStore } from "@/store/useTimelineStore";
import {
  AOI_CENTER,
  DARK_TILE_ATTRIBUTION,
  DARK_TILE_URL,
  DEFAULT_MAP_ZOOM,
  TILE_STATUS_COLOR,
  TILE_STATUS_LABEL,
} from "@/lib/constants";
import type { TileInfo, EphemerisPoint } from "@/lib/types";

// Hex literals — Leaflet writes these straight into SVG `stroke`.
const PHOS = "#d8f76b";
const WARN = "#ff8a5c";
const FG_FAINT = "#5d6483";
const FG_MUTE = "#9aa1bb";

type IconDefaultPrototype = L.Icon.Default & { _getIconUrl?: () => string };
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;

export default function CoverageMapInner() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectedTileId = useAppStore((s) => s.selectedTileId);
  const selectTile = useAppStore((s) => s.selectTile);

  const { data: cases } = useCases();
  const caseConfig = cases?.find((c) => c.id === selectedCaseId);
  const { data: ephemeris } = useEphemeris(selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const tiles = result?.plan?.tiles;
  const imagingWindow = result?.plan?.diagnostics.imaging_window_s;

  const orbitTrack = useMemo(() => {
    if (!ephemeris) return [] as [number, number][];
    return ephemeris.points.map(
      (p) => [p.lat_deg, p.lon_deg] as [number, number]
    );
  }, [ephemeris]);

  const insideTrack = useMemo(() => {
    if (!ephemeris || !imagingWindow) return [] as [number, number][];
    return ephemeris.points
      .filter((p) => p.t >= imagingWindow[0] && p.t <= imagingWindow[1])
      .map((p) => [p.lat_deg, p.lon_deg] as [number, number]);
  }, [ephemeris, imagingWindow]);

  return (
    <MapContainer
      center={AOI_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      className="h-full w-full"
      attributionControl
      zoomControl
    >
      <TileLayer url={DARK_TILE_URL} attribution={DARK_TILE_ATTRIBUTION} />

      {caseConfig && caseConfig.aoi_polygon.length > 0 && (
        <Polygon
          positions={caseConfig.aoi_polygon}
          pathOptions={{
            color: PHOS,
            weight: 1.5,
            dashArray: "4 3",
            fillColor: PHOS,
            fillOpacity: 0.06,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
              AOI · {caseConfig.name}
            </span>
          </Tooltip>
        </Polygon>
      )}

      {orbitTrack.length > 0 && (
        <Polyline
          positions={orbitTrack}
          pathOptions={{
            color: FG_FAINT,
            weight: 1,
            dashArray: "2 4",
            opacity: 0.6,
          }}
        />
      )}

      {insideTrack.length > 0 && (
        <Polyline
          positions={insideTrack}
          pathOptions={{ color: FG_MUTE, weight: 2.5, opacity: 1 }}
        />
      )}

      {ephemeris?.closest_approach && (
        <CircleMarker
          center={[
            ephemeris.closest_approach.lat_deg,
            ephemeris.closest_approach.lon_deg,
          ]}
          radius={4}
          pathOptions={{
            color: PHOS,
            weight: 1.5,
            fillColor: PHOS,
            fillOpacity: 0.25,
          }}
        >
          <Tooltip>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
              CA · t={ephemeris.closest_approach.t.toFixed(0)}s · ONA{" "}
              {ephemeris.closest_approach.min_off_nadir_deg.toFixed(2)}°
            </span>
          </Tooltip>
        </CircleMarker>
      )}

      {tiles?.map((tile) => (
        <TileMarker
          key={tile.id}
          tile={tile}
          selected={tile.id === selectedTileId}
          onClick={() =>
            selectTile(tile.id === selectedTileId ? null : tile.id)
          }
        />
      ))}

      {/* Satellite is its OWN subscriber — parent does NOT subscribe to
          currentTime, so MapContainer never re-renders during playback. */}
      {ephemeris && ephemeris.points.length > 0 && (
        <SatelliteMarker points={ephemeris.points} />
      )}
    </MapContainer>
  );
}

/* --------------------------------------------------------------
   Satellite — subscribes to currentTime independently. Only this
   one CircleMarker re-renders on every RAF tick.
   -------------------------------------------------------------- */
function SatelliteMarker({ points }: { points: EphemerisPoint[] }) {
  const currentTime = useTimelineStore((s) => s.currentTime);

  const idx = Math.max(
    0,
    Math.min(points.length - 1, Math.round(currentTime))
  );
  const p = points[idx];
  if (!p) return null;

  return (
    <CircleMarker
      center={[p.lat_deg, p.lon_deg]}
      radius={6}
      pathOptions={{
        color: PHOS,
        weight: 1.5,
        fillColor: PHOS,
        fillOpacity: 0.85,
      }}
    >
      <Popup>
        <div
          style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
          className="flex flex-col gap-0.5"
        >
          <strong style={{ color: PHOS }}>SAT</strong>
          <span>t = {p.t.toFixed(1)} s</span>
          <span>alt = {p.alt_km.toFixed(1)} km</span>
          <span>ONA→AOI = {p.off_nadir_to_aoi_center_deg.toFixed(2)}°</span>
          <span>
            {p.lat_deg.toFixed(3)}°, {p.lon_deg.toFixed(3)}°
          </span>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function TileMarker({
  tile,
  selected,
  onClick,
}: {
  tile: TileInfo;
  selected: boolean;
  onClick: () => void;
}) {
  const color = TILE_STATUS_COLOR[tile.status];
  const isImaged = tile.status === "imaged";

  if (tile.footprint && tile.footprint.length >= 3) {
    return (
      <Polygon
        positions={tile.footprint}
        eventHandlers={{ click: onClick }}
        pathOptions={{
          color,
          weight: selected ? 2 : 1,
          fillColor: color,
          fillOpacity: isImaged ? (selected ? 0.5 : 0.3) : 0,
          dashArray: isImaged ? undefined : "3 3",
        }}
      >
        <Tooltip>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
            {tile.id} · {TILE_STATUS_LABEL[tile.status]} · ONA{" "}
            {tile.off_nadir_deg.toFixed(1)}°
          </span>
        </Tooltip>
      </Polygon>
    );
  }

  return (
    <CircleMarker
      center={[tile.center_lat, tile.center_lon]}
      radius={selected ? 5 : 3}
      eventHandlers={{ click: onClick }}
      pathOptions={{
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.35,
      }}
    >
      <Tooltip>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
          {tile.id} · {TILE_STATUS_LABEL[tile.status]}
        </span>
      </Tooltip>
    </CircleMarker>
  );
}

// Suppress unused import warning for WARN — used by status palette indirectly.
void WARN;
