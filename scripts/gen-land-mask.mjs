// Rasterise Natural Earth land into a fine equirectangular mask using even-odd scanlines,
// then store it as per-row run lengths (sea, land, sea, ...) in LEB128 varints.
import fs from "fs";
const [, , src, out] = process.argv;
const STEP = 0.0625, LAT_TOP = 80, LAT_BOT = -58;
const W = Math.round(360 / STEP), H = Math.round((LAT_TOP - LAT_BOT) / STEP);
const geo = JSON.parse(fs.readFileSync(src, "utf8"));
const edges = [];
for (const f of geo.features) {
  const g = f.geometry;
  for (const poly of g.type === "Polygon" ? [g.coordinates] : g.coordinates)
    for (const ring of poly)
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [x1, y1] = ring[j], [x2, y2] = ring[i];
        if (y1 !== y2) edges.push([x1, y1, x2, y2, Math.min(y1, y2), Math.max(y1, y2)]);
      }
}
const bytes = [];
const varint = (n) => { while (n > 127) { bytes.push((n & 127) | 128); n >>>= 7; } bytes.push(n); };
let landCells = 0;
for (let r = 0; r < H; r++) {
  const lat = LAT_TOP - (r + 0.5) * STEP;
  const xs = [];
  for (const [x1, y1, x2, y2, lo, hi] of edges)
    if (lat >= lo && lat < hi) xs.push(x1 + ((lat - y1) * (x2 - x1)) / (y2 - y1));
  xs.sort((a, b) => a - b);
  const row = new Uint8Array(W);
  for (let k = 0; k + 1 < xs.length; k += 2) {
    const a = Math.max(0, Math.ceil((xs[k] + 180) / STEP - 0.5));
    const b = Math.min(W - 1, Math.floor((xs[k + 1] + 180) / STEP - 0.5));
    for (let c = a; c <= b; c++) row[c] ^= 1;
  }
  let cur = 0, run = 0;
  for (let c = 0; c < W; c++) {
    if (row[c] !== cur) { varint(run); cur = row[c]; run = 0; }
    run++; landCells += row[c];
  }
  varint(run);
}
fs.writeFileSync(out, Buffer.from(bytes));
console.log({ W, H, bytes: bytes.length, landPct: (100 * landCells / (W * H)).toFixed(1) });
