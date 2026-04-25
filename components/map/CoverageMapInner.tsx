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
import type { TileInfo } from "@/lib/types";

// Fix default marker icons being absent (we don't use them, but avoids warnings)
type IconDefaultPrototype = L.Icon.Default & { _getIconUrl?: () => string };
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;

export default function CoverageMapInner() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectedTileId = useAppStore((s) => s.selectedTileId);
  const selectTile = useAppStore((s) => s.selectTile);
  const currentTime = useTimelineStore((s) => s.currentTime);

  const { data: cases } = useCases();
  const caseConfig = cases?.find((c) => c.id === selectedCaseId);
  const { data: ephemeris } = useEphemeris(selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const tiles = result?.plan?.tiles;
  const imagingWindow = result?.plan?.diagnostics.imaging_window_s;

  const orbitTrack = useMemo(() => {
    if (!ephemeris) return [];
    return ephemeris.points.map(
      (p) => [p.lat_deg, p.lon_deg] as [number, number]
    );
  }, [ephemeris]);

  const insideTrack = useMemo(() => {
    if (!ephemeris || !imagingWindow) return [];
    return ephemeris.points
      .filter((p) => p.t >= imagingWindow[0] && p.t <= imagingWindow[1])
      .map((p) => [p.lat_deg, p.lon_deg] as [number, number]);
  }, [ephemeris, imagingWindow]);

  const satPos = useMemo(() => {
    if (!ephemeris) return null;
    const idx = Math.max(
      0,
      Math.min(ephemeris.points.length - 1, Math.round(currentTime))
    );
    const p = ephemeris.points[idx];
    return p ? { lat: p.lat_deg, lon: p.lon_deg, alt: p.alt_km, ona: p.off_nadir_to_aoi_center_deg, t: p.t } : null;
  }, [ephemeris, currentTime]);

  return (
    <MapContainer
      center={AOI_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      className="h-full w-full"
      attributionControl
      zoomControl
    >
      <TileLayer url={DARK_TILE_URL} attribution={DARK_TILE_ATTRIBUTION} />

      {caseConfig && (
        <Polygon
          positions={caseConfig.aoi_polygon}
          pathOptions={{
            color: "var(--aoi-stroke)",
            weight: 1.5,
            dashArray: "4 4",
            fillColor: "var(--aoi-stroke)",
            fillOpacity: 0.08,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 11 }}>
              AOI · {caseConfig.name}
            </span>
          </Tooltip>
        </Polygon>
      )}

      {orbitTrack.length > 0 && (
        <Polyline
          positions={orbitTrack}
          pathOptions={{
            color: "var(--orbit-track)",
            weight: 1,
            dashArray: "2 4",
            opacity: 0.6,
          }}
        />
      )}

      {insideTrack.length > 0 && (
        <Polyline
          positions={insideTrack}
          pathOptions={{
            color: "var(--orbit-track)",
            weight: 2.5,
            opacity: 1,
          }}
        />
      )}

      {ephemeris?.closest_approach && (
        <CircleMarker
          center={[
            ephemeris.closest_approach.lat_deg,
            ephemeris.closest_approach.lon_deg,
          ]}
          radius={5}
          pathOptions={{
            color: "var(--accent-primary)",
            weight: 2,
            fillColor: "var(--accent-primary)",
            fillOpacity: 0.4,
          }}
        >
          <Tooltip>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
              CA · t={ephemeris.closest_approach.t.toFixed(0)}s · ONA=
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

      {satPos && (
        <CircleMarker
          center={[satPos.lat, satPos.lon]}
          radius={6}
          pathOptions={{
            color: "var(--sat-marker)",
            weight: 2,
            fillColor: "var(--sat-marker)",
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div
              style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
              className="flex flex-col gap-0.5"
            >
              <strong>Satellite</strong>
              <span>t = {satPos.t.toFixed(1)} s</span>
              <span>alt = {satPos.alt.toFixed(1)} km</span>
              <span>ONA→AOI = {satPos.ona.toFixed(2)}°</span>
              <span>
                {satPos.lat.toFixed(3)}°, {satPos.lon.toFixed(3)}°
              </span>
            </div>
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
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
          fillOpacity: isImaged ? (selected ? 0.45 : 0.25) : 0,
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

  // No footprint → show tile center marker
  return (
    <CircleMarker
      center={[tile.center_lat, tile.center_lon]}
      radius={selected ? 5 : 3}
      eventHandlers={{ click: onClick }}
      pathOptions={{
        color,
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.3,
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
