// Fine land/sea mask for /map, loaded from public/map/land.bin.
// Equirectangular grid, MASK_STEP degrees per cell, 80°N down to 58°S, west to east from 180°W.
// The file stores each row as run lengths (sea, land, sea, …) in LEB128 varints.
// Regenerate with: node scripts/gen-land-mask.mjs ne_50m_land.geojson public/map/land.bin
// (Natural Earth 1:50m land, public domain), then bump MASK_URL's ?v=.
export const MASK_STEP = 0.0625;
export const MASK_LAT_TOP = 80;
export const MASK_LAT_BOTTOM = -58;
export const MASK_W = Math.round(360 / MASK_STEP);
export const MASK_H = Math.round((MASK_LAT_TOP - MASK_LAT_BOTTOM) / MASK_STEP);
const MASK_URL = "/map/land.bin?v=1";

export type LandMask = {
  /** Is the point land? lon -180..180, lat in the mask range (outside counts as sea). */
  isLand(lon: number, lat: number): boolean;
};

function decode(bytes: Uint8Array): LandMask {
  const bits = new Uint8Array(Math.ceil((MASK_W * MASK_H) / 8));
  let p = 0;
  for (let r = 0; r < MASK_H; r++) {
    let c = 0;
    let land = false;
    while (c < MASK_W) {
      let n = 0;
      let shift = 0;
      let b: number;
      do {
        b = bytes[p++];
        n |= (b & 127) << shift;
        shift += 7;
      } while (b & 128);
      if (land) for (let i = r * MASK_W + c, end = i + n; i < end; i++) bits[i >> 3] |= 1 << (i & 7);
      c += n;
      land = !land;
    }
  }
  return {
    isLand(lon, lat) {
      const c = Math.floor((lon + 180) / MASK_STEP);
      const r = Math.floor((MASK_LAT_TOP - lat) / MASK_STEP);
      if (c < 0 || c >= MASK_W || r < 0 || r >= MASK_H) return false;
      const i = r * MASK_W + c;
      return ((bits[i >> 3] >> (i & 7)) & 1) === 1;
    },
  };
}

let pending: Promise<LandMask> | null = null;

export function loadLandMask(): Promise<LandMask> {
  pending ??= fetch(MASK_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`land mask ${res.status}`);
      return res.arrayBuffer();
    })
    .then((buf) => decode(new Uint8Array(buf)))
    .catch((err) => {
      pending = null; // allow a retry on the next mount
      throw err;
    });
  return pending;
}
