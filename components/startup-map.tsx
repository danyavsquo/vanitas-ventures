"use client";

import * as React from "react";
import { ArrowUpRight, Maximize2, Minus, Plus, X } from "lucide-react";
import { loadLandMask, MASK_LAT_BOTTOM, MASK_LAT_TOP, MASK_STEP, type LandMask } from "@/lib/land-mask";
import { startups, type Startup } from "@/lib/startups";
import { cn } from "@/lib/utils";

// World space is in degrees: x = lng + 180, y = top latitude - lat.
const LAT_TOP = MASK_LAT_TOP;
const COLS = 360;
const ROWS = MASK_LAT_TOP - MASK_LAT_BOTTOM;

const toWorld = (lat: number, lng: number) => ({ x: lng + 180, y: LAT_TOP - lat });

// Dot grids from coarse to fine (degrees between dots). Zooming in switches to the next finer
// grid once its dots would sit at least MIN_SPACING px apart, so dot spacing stays 5–10px on screen.
const LEVELS = [1, 0.5, 0.25, 0.125, MASK_STEP];
const MIN_SPACING = 5;
const levelFor = (s: number) => {
  let d = LEVELS[0];
  for (const l of LEVELS) if (l * s >= MIN_SPACING) d = l;
  return d;
};

const MAX_SCALE = 200; // px per degree at full zoom (finest grid ≈ 12px apart)
const LAND_COLOR = "rgba(255,255,255,0.92)";
const SEA_COLOR = "rgba(255,255,255,0.09)";

// One sea dot on a transparent tile; repeated as a pattern it fills the whole screen cheaply.
const TILE = 32;
let seaTile: HTMLCanvasElement | null = null;
function getSeaTile() {
  if (!seaTile) {
    seaTile = document.createElement("canvas");
    seaTile.width = seaTile.height = TILE;
    const t = seaTile.getContext("2d")!;
    t.fillStyle = SEA_COLOR;
    t.beginPath();
    t.arc(TILE / 2, TILE / 2, TILE * 0.17, 0, Math.PI * 2);
    t.fill();
  }
  return seaTile;
}

type View = { s: number; x: number; y: number }; // screen = world * s + (x, y)
type Size = { w: number; h: number };

const minScale = ({ w, h }: Size) => Math.min(w / COLS, h / ROWS) * 0.94;

function clampView(v: View, size: Size): View {
  const s = Math.min(MAX_SCALE, Math.max(minScale(size), v.s));
  const axis = (off: number, worldPx: number, screen: number) =>
    worldPx <= screen ? (screen - worldPx) / 2 : Math.min(0, Math.max(screen - worldPx, off));
  return { s, x: axis(v.x, COLS * s, size.w), y: axis(v.y, ROWS * s, size.h) };
}

function initialView(size: Size): View {
  // Landscape screens see the whole world; portrait phones start zoomed so the land stays readable.
  const portrait = size.h > size.w;
  const s = portrait ? Math.max(minScale(size), (size.h * 0.6) / ROWS) : minScale(size);
  // Centre on 15°E / 25°N, roughly between the Americas and Asia.
  const c = toWorld(25, 15);
  return clampView({ s, x: size.w / 2 - c.x * s, y: size.h / 2 - c.y * s }, size);
}

function zoomAt(v: View, factor: number, px: number, py: number): View {
  const s = v.s * factor;
  return { s, x: px - ((px - v.x) / v.s) * s, y: py - ((py - v.y) / v.s) * s };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function StartupMap() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sizeRef = React.useRef<Size>({ w: 0, h: 0 });
  const viewRef = React.useRef<View>({ s: 1, x: 0, y: 0 });
  const animRef = React.useRef<number | null>(null);
  const [view, setViewState] = React.useState<View | null>(null);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [mask, setMask] = React.useState<LandMask | null>(null);

  React.useEffect(() => {
    let alive = true;
    loadLandMask()
      .then((m) => alive && setMask(m))
      .catch((err) => console.error("Could not load the map", err));
    return () => {
      alive = false;
    };
  }, []);

  const setView = React.useCallback((next: View) => {
    const v = clampView(next, sizeRef.current);
    viewRef.current = v;
    setViewState(v);
  }, []);

  const stopAnim = () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  };

  const animateTo = React.useCallback(
    (target: View) => {
      stopAnim();
      const from = viewRef.current;
      const to = clampView(target, sizeRef.current);
      const start = performance.now();
      const step = (now: number) => {
        const t = easeOut(Math.min(1, (now - start) / 320));
        // Interpolate scale geometrically so the zoom feels even.
        const s = from.s * Math.pow(to.s / from.s, t);
        setView({ s, x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
        animRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animRef.current = requestAnimationFrame(step);
    },
    [setView]
  );

  const zoomBy = React.useCallback(
    (factor: number) => {
      const { w, h } = sizeRef.current;
      const v = viewRef.current;
      const s = Math.min(MAX_SCALE, Math.max(minScale(sizeRef.current), v.s * factor));
      animateTo(zoomAt(v, s / v.s, w / 2, h / 2));
    },
    [animateTo]
  );

  // Size the canvas to its box (and keep the same point in the middle on resize).
  React.useEffect(() => {
    const wrap = wrapRef.current!;
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const prev = sizeRef.current;
      const size = { w: rect.width, h: rect.height };
      sizeRef.current = size;
      if (!prev.w) return setView(initialView(size));
      const v = viewRef.current;
      setView({ ...v, x: v.x + (size.w - prev.w) / 2, y: v.y + (size.h - prev.h) / 2 });
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [setView]);

  // Draw the visible dots.
  React.useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !view) return;
    const { w, h } = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { s, x, y } = view;
    const d = levelFor(s);
    const sp = d * s; // on-screen distance between dots

    // Sea: the dot pattern covers the whole screen, not just the map's rectangle.
    const pattern = ctx.createPattern(getSeaTile(), "repeat")!;
    const k = sp / TILE;
    pattern.setTransform(new DOMMatrix([k, 0, 0, k, x, y]));
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);

    // Land: sample the fine mask at the centre of every visible dot of the current grid.
    if (!mask) return;
    const cols = Math.round(COLS / d);
    const rows = Math.round(ROWS / d);
    const c0 = Math.max(0, Math.floor(-x / sp));
    const c1 = Math.min(cols - 1, Math.ceil((w - x) / sp));
    const r0 = Math.max(0, Math.floor(-y / sp));
    const r1 = Math.min(rows - 1, Math.ceil((h - y) / sp));
    const landR = Math.max(0.55, sp * 0.34);

    const land = new Path2D();
    for (let r = r0; r <= r1; r++) {
      const lat = LAT_TOP - (r + 0.5) * d;
      const cy = y + (r + 0.5) * sp;
      for (let c = c0; c <= c1; c++) {
        if (!mask.isLand(-180 + (c + 0.5) * d, lat)) continue;
        const cx = x + (c + 0.5) * sp;
        land.moveTo(cx + landR, cy);
        land.arc(cx, cy, landR, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = LAND_COLOR;
    ctx.fill(land);
  }, [view, mask]);

  // Active pointers for drag-to-pan and two-finger pinch (handlers below).
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const gesture = React.useRef<{ dist: number; mx: number; my: number; moved: number } | null>(null);

  // Wheel / trackpad zoom, plus Safari's own pinch gesture events. Non-passive so the page never zooms.
  React.useEffect(() => {
    const wrap = wrapRef.current!;
    const local = (e: { clientX: number; clientY: number }) => {
      const r = wrap.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnim();
      const [px, py] = local(e);
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      // Scroll zooms (like most web maps); a trackpad pinch arrives as ctrl+wheel and gets more gain.
      const gain = e.ctrlKey ? 0.012 : 0.0022;
      const dy = Math.max(-200, Math.min(200, e.deltaY * unit));
      setView(zoomAt(viewRef.current, Math.exp(-dy * gain), px, py));
    };
    let gestureStart: { s: number; px: number; py: number; v: View } | null = null;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      const g = e as unknown as { clientX: number; clientY: number };
      const [px, py] = local(g);
      gestureStart = { s: 1, px, py, v: viewRef.current };
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      if (!gestureStart || pointers.current.size > 1) return;
      const scale = (e as unknown as { scale: number }).scale;
      setView(zoomAt(gestureStart.v, scale, gestureStart.px, gestureStart.py));
    };
    const block = (e: Event) => e.preventDefault();
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("gesturestart", onGestureStart);
    wrap.addEventListener("gesturechange", onGestureChange);
    wrap.addEventListener("gestureend", block);
    return () => {
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("gesturestart", onGestureStart);
      wrap.removeEventListener("gesturechange", onGestureChange);
      wrap.removeEventListener("gestureend", block);
    };
  }, [setView]);


  const localPoint = (e: React.PointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const pinchState = () => {
    const [a, b] = [...pointers.current.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    stopAnim();
    wrapRef.current!.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, localPoint(e));
    const moved = gesture.current?.moved ?? 0;
    if (pointers.current.size === 2) gesture.current = { ...pinchState(), moved };
    else if (pointers.current.size === 1) {
      const p = localPoint(e);
      gesture.current = { dist: 0, mx: p.x, my: p.y, moved: 0 };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, localPoint(e));
    const g = gesture.current;
    const v = viewRef.current;
    if (pointers.current.size >= 2) {
      const p = pinchState();
      const zoomed = zoomAt(v, p.dist / g.dist, p.mx, p.my);
      setView({ ...zoomed, x: zoomed.x + p.mx - g.mx, y: zoomed.y + p.my - g.my });
      gesture.current = { ...p, moved: g.moved + 10 };
    } else {
      const p = localPoint(e);
      setView({ ...v, x: v.x + p.x - g.mx, y: v.y + p.y - g.my });
      gesture.current = { ...g, mx: p.x, my: p.y, moved: g.moved + Math.abs(p.x - g.mx) + Math.abs(p.y - g.my) };
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (pointers.current.size === 0) {
      // A tap on empty map (not a drag) closes the open card.
      if (g && g.moved < 5) setSelected(null);
      gesture.current = null;
    } else if (pointers.current.size === 1 && g) {
      const [p] = [...pointers.current.values()];
      gesture.current = { dist: 0, mx: p.x, my: p.y, moved: g.moved };
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const v = viewRef.current;
    const pan = 80;
    const keys: Record<string, () => void> = {
      "+": () => zoomBy(1.6),
      "=": () => zoomBy(1.6),
      "-": () => zoomBy(1 / 1.6),
      "0": () => animateTo(initialView(sizeRef.current)),
      ArrowLeft: () => animateTo({ ...v, x: v.x + pan }),
      ArrowRight: () => animateTo({ ...v, x: v.x - pan }),
      ArrowUp: () => animateTo({ ...v, y: v.y + pan }),
      ArrowDown: () => animateTo({ ...v, y: v.y - pan }),
      Escape: () => setSelected(null),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  const focusStartup = (i: number) => {
    setSelected(i);
    const { w, h } = sizeRef.current;
    const p = toWorld(startups[i].lat, startups[i].lng);
    const s = Math.max(viewRef.current.s, 40);
    animateTo({ s, x: w / 2 - p.x * s, y: h / 2 - p.y * s });
  };

  const atMin = view ? view.s <= minScale(sizeRef.current) + 1e-6 : true;
  const atMax = view ? view.s >= MAX_SCALE - 1e-6 : false;

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="application"
      aria-label="World map of Vanitas Ventures startups. Drag to move, scroll or pinch to zoom, or use the arrow and plus/minus keys."
      className="relative h-full w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {view &&
        startups.map((st, i) => {
          const p = toWorld(st.lat, st.lng);
          return (
            <StartupMarker
              key={`${st.name}-${i}`}
              startup={st}
              left={view.x + p.x * view.s}
              top={view.y + p.y * view.s}
              size={Math.max(10, Math.min(22, levelFor(view.s) * view.s * 1.5))}
              open={selected === i}
              onOpen={() => focusStartup(i)}
              onClose={() => setSelected(null)}
            />
          );
        })}

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-5 left-4 flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.04] px-4 py-2 text-xs font-medium text-foreground/75 backdrop-blur-md sm:left-6">
        <span className="h-2 w-2 rounded-full bg-foreground shadow-[0_0_0_3px_rgba(255,255,255,.2)]" />
        {startups.length === 0
          ? "Startups — Work in Progress"
          : `${startups.length} startup${startups.length === 1 ? "" : "s"}`}
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-5 right-4 flex flex-col gap-1 rounded-full border border-foreground/15 bg-foreground/[0.04] p-1 backdrop-blur-md sm:right-6"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ControlButton label="Zoom in" disabled={atMax} onClick={() => zoomBy(1.6)}>
          <Plus className="h-4 w-4" />
        </ControlButton>
        <ControlButton label="Zoom out" disabled={atMin} onClick={() => zoomBy(1 / 1.6)}>
          <Minus className="h-4 w-4" />
        </ControlButton>
        <ControlButton label="Reset view" onClick={() => animateTo(initialView(sizeRef.current))}>
          <Maximize2 className="h-3.5 w-3.5" />
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function StartupMarker({
  startup,
  left,
  top,
  size,
  open,
  onOpen,
  onClose,
}: {
  startup: Startup;
  left: number;
  top: number;
  size: number;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className={cn("absolute", open ? "z-20" : "z-10")}
      style={{ transform: `translate(${left}px, ${top}px)`, left: 0, top: 0 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={startup.name}
        aria-expanded={open}
        onClick={open ? onClose : onOpen}
        className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2"
      >
        <span
          className="relative block rounded-full bg-foreground shadow-[0_0_0_4px_rgba(111,75,47,.9),0_0_0_5px_rgba(255,255,255,.5)] transition-transform group-hover:scale-110"
          style={{ width: size, height: size }}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-foreground/50 [animation-duration:2.4s]" />
        </span>
        {!open && (
          <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-foreground/15 bg-background/70 px-3 py-1 text-xs font-medium text-foreground opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {startup.name}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={startup.name}
          className="absolute left-0 top-0 w-64 rounded-2xl border border-foreground/15 bg-background/80 p-4 text-left text-foreground shadow-[0_12px_32px_rgba(0,0,0,.25)] backdrop-blur-md"
          style={{ transform: `translate(-50%, calc(-100% - ${size / 2 + 16}px))` }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <h2 className="pr-6 text-base font-semibold leading-tight">{startup.name}</h2>
          {startup.location && <p className="mt-1 text-xs text-foreground/60">{startup.location}</p>}
          {startup.description && <p className="mt-2 text-sm leading-snug text-foreground/80">{startup.description}</p>}
          {startup.href && (
            <a
              href={startup.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-85"
            >
              Visit <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
