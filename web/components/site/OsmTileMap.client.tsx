"use client";

import { useMemo, useState } from "react";

const TILE_SIZE = 256;
const DEFAULT_VIEW_WIDTH = 1536;
const DEFAULT_VIEW_HEIGHT = 768;

type OsmTileMapProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  viewWidth?: number;
  viewHeight?: number;
  showControls?: boolean;
  showMarker?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  className?: string;
};

function clampLatitude(latitude: number) {
  return Math.max(-85.05112878, Math.min(85.05112878, latitude));
}

function clampZoom(zoom: number, minZoom: number, maxZoom: number) {
  return Math.max(minZoom, Math.min(maxZoom, Math.round(zoom)));
}

function makeOsmTiles(latitude: number, longitude: number, zoom: number, viewWidth: number, viewHeight: number) {
  const scale = 2 ** zoom;
  const safeLatitude = clampLatitude(latitude);
  const xFloat = ((longitude + 180) / 360) * scale;
  const latitudeRadians = (safeLatitude * Math.PI) / 180;
  const yFloat =
    ((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2) * scale;
  const centerPxX = xFloat * TILE_SIZE;
  const centerPxY = yFloat * TILE_SIZE;
  const leftPx = centerPxX - viewWidth / 2;
  const topPx = centerPxY - viewHeight / 2;
  const startX = Math.floor(leftPx / TILE_SIZE);
  const endX = Math.floor((leftPx + viewWidth) / TILE_SIZE);
  const startY = Math.floor(topPx / TILE_SIZE);
  const endY = Math.floor((topPx + viewHeight) / TILE_SIZE);
  const tiles: Array<{
    key: string;
    src: string;
    left: number;
    top: number;
  }> = [];

  for (let x = startX; x <= endX; x += 1) {
    const wrappedX = ((x % scale) + scale) % scale;

    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= scale) continue;

      tiles.push({
        key: `${zoom}-${wrappedX}-${y}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: Math.round(x * TILE_SIZE - leftPx),
        top: Math.round(y * TILE_SIZE - topPx),
      });
    }
  }

  return tiles;
}

export default function OsmTileMap({
  latitude,
  longitude,
  zoom = 15,
  minZoom = 11,
  maxZoom = 18,
  viewWidth = DEFAULT_VIEW_WIDTH,
  viewHeight = DEFAULT_VIEW_HEIGHT,
  showControls = false,
  showMarker = false,
  loading = false,
  ariaLabel = "Karte",
  className,
}: OsmTileMapProps) {
  const initialZoom = clampZoom(zoom, minZoom, maxZoom);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const tiles = useMemo(
    () => makeOsmTiles(latitude, longitude, currentZoom, viewWidth, viewHeight),
    [latitude, longitude, currentZoom, viewWidth, viewHeight],
  );

  return (
    <div
      className={[
        "relative isolate overflow-hidden bg-[#dce7ef]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      role={showControls ? "group" : "img"}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: viewWidth, height: viewHeight }}
      >
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="absolute h-[256px] w-[256px] select-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      {showMarker ? (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-full"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-1 h-8 w-8 -translate-x-1/2 rotate-45 rounded-full rounded-br-sm border border-[#5c8e2f] bg-[#76b943] shadow-[0_3px_10px_rgba(15,23,42,0.35)]" />
          <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full border border-[#5c8e2f] bg-white" />
        </div>
      ) : null}

      {showControls ? (
        <div className="absolute right-4 top-4 z-20 overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.16)]">
          <button
            type="button"
            aria-label="Karte vergrößern"
            disabled={currentZoom >= maxZoom}
            onClick={() => setCurrentZoom((value) => clampZoom(value + 1, minZoom, maxZoom))}
            className="grid h-11 w-11 place-items-center text-2xl font-semibold leading-none text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            +
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            aria-label="Karte verkleinern"
            disabled={currentZoom <= minZoom}
            onClick={() => setCurrentZoom((value) => clampZoom(value - 1, minZoom, maxZoom))}
            className="grid h-11 w-11 place-items-center text-3xl font-semibold leading-none text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            -
          </button>
        </div>
      ) : null}

      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-20 rounded bg-white/90 px-2 py-1 text-[11px] leading-none text-slate-700 shadow-sm hover:text-slate-950"
      >
        © OpenStreetMap
      </a>

      {loading ? (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-white/65 backdrop-blur-[1px]">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Karte wird geladen...
          </div>
        </div>
      ) : null}
    </div>
  );
}
