"use client";

import * as React from "react";
import { Activity, ArrowUpRight, MapPin, MessageCircle, Sparkles, X } from "lucide-react";
import type { LandMask } from "@/lib/land-mask";
import { asset } from "@/lib/base-path";
import type { Startup } from "@/lib/startups";
import { cn } from "@/lib/utils";

// Startup details popup. Layout follows the 21st.dev "features-9" block (bordered cells:
// map + headline, chat, a full-width stat, a full-width section), restyled for the brown theme
// and filled only with facts from the startup's own website. No invented metrics or charts.
export function StartupPanel({
  startup,
  mask,
  onClose,
}: {
  startup: Startup;
  mask: LandMask | null;
  onClose: () => void;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const label = "flex items-center gap-2 text-sm text-foreground/60";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={startup.name}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[88dvh] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl border border-foreground/15 bg-background text-foreground shadow-[0_24px_64px_rgba(0,0,0,.35)] outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-foreground/15 bg-background/90 px-5 py-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {startup.logo ? (
              <img src={asset(startup.logo)} alt={startup.name} className="h-5 w-auto sm:h-6" />
            ) : (
              <h2 className="truncate text-lg font-semibold">{startup.name}</h2>
            )}
            {startup.location && (
              <span className="hidden truncate text-sm text-foreground/60 sm:inline">{startup.location}</span>
            )}
            {startup.stage && (
              <span className="shrink-0 rounded-full border border-foreground/20 bg-foreground/[0.08] px-2.5 py-0.5 text-xs font-medium text-foreground/85">
                {startup.stage}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {startup.href && (
              <a
                href={startup.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${startup.name} website`}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-foreground px-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 sm:px-4"
              >
                <span className="hidden sm:inline">Visit</span> <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {/* Where + what */}
          <div>
            <div className="p-6 sm:p-10">
              <span className={label}>
                <MapPin className="size-4" />
                {startup.offices?.length ? startup.offices.join(" · ") : startup.location}
              </span>
              {startup.headline && <p className="mt-6 text-2xl font-semibold leading-snug">{startup.headline}</p>}
              {startup.description && (
                <p className="mt-4 text-sm leading-relaxed text-foreground/75">{startup.description}</p>
              )}
            </div>

            <div aria-hidden className="relative">
              {startup.location && (
                <div className="absolute left-1/2 top-1/2 z-10 size-fit -translate-x-1/2 -translate-y-[calc(100%+18px)]">
                  <div className="relative z-[1] flex w-fit items-center gap-2 rounded-lg border border-foreground/15 bg-background px-3 py-1 text-xs font-medium shadow-md shadow-black/10">
                    {startup.flag && <span className="text-lg">{startup.flag}</span>} {startup.location}
                  </div>
                  <div className="absolute inset-2 -bottom-2 mx-auto rounded-lg border border-foreground/15 bg-[#654429] px-3 py-4 shadow-md shadow-black/10" />
                </div>
              )}
              <MiniDotMap mask={mask} lat={startup.lat} lng={startup.lng} />
            </div>
          </div>

          {/* Highlight + chat */}
          {(startup.highlight || startup.chat) && (
            <div className="overflow-hidden border-t border-foreground/15 bg-foreground/[0.04] p-6 sm:p-10 md:border-l md:border-t-0">
              {startup.highlight && (
                <div className="relative z-10">
                  <span className={label}>
                    <MessageCircle className="size-4" />
                    {startup.highlight.label}
                  </span>
                  <p className="my-6 text-2xl font-semibold leading-snug">{startup.highlight.title}</p>
                </div>
              )}
              {startup.chat && (
                <div aria-hidden className="flex flex-col gap-6">
                  {startup.chat.map((m, i) =>
                    m.from === "user" ? (
                      <div key={i}>
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full border border-foreground/30">
                            <span className="size-3 rounded-full bg-foreground" />
                          </span>
                          <span className="text-xs text-foreground/60">Caller</span>
                        </div>
                        <div className="mt-1.5 w-4/5 rounded-lg border border-foreground/15 bg-background p-3 text-xs sm:w-3/5">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div key={i}>
                        <div className="mb-1 ml-auto w-4/5 rounded-lg bg-foreground p-3 text-xs text-background sm:w-3/5">
                          {m.text}
                        </div>
                        <span className="block text-right text-xs text-foreground/60">{startup.name} agent</span>
                      </div>
                    )
                  )}
                </div>
              )}
              {startup.highlight?.text && (
                <p className="mt-8 text-sm leading-relaxed text-foreground/75">{startup.highlight.text}</p>
              )}
            </div>
          )}

          {/* Big stat */}
          {startup.stat && (
            <div className="col-span-full border-y border-foreground/15 p-8 text-center sm:p-12">
              <p className="text-4xl font-semibold lg:text-6xl">{startup.stat.value}</p>
              <p className="mt-3 text-sm text-foreground/60">{startup.stat.label}</p>
            </div>
          )}

          {/* How it works */}
          {startup.steps && (
            <div className="col-span-full p-6 sm:p-10">
              <span className={label}>
                <Activity className="size-4" />
                How it works
              </span>
              <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-foreground/15 bg-foreground/15 sm:grid-cols-3">
                {startup.steps.map((step, i) => (
                  <li key={step.title} className="bg-background p-5">
                    <span className="text-xs font-medium text-foreground/50">0{i + 1}</span>
                    <p className="mt-2 font-semibold">{step.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Features */}
          {startup.features && (
            <div className="col-span-full border-t border-foreground/15 p-6 sm:p-10">
              <span className={label}>
                <Sparkles className="size-4" />
                Features & use cases
              </span>
              <ul className="mt-5 flex flex-wrap gap-2">
                {startup.features.map((f) => (
                  <li
                    key={f}
                    className="rounded-full border border-foreground/15 bg-foreground/[0.06] px-3 py-1 text-xs font-medium text-foreground/85"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// A small dot map around the startup, drawn from the same land mask as the big map.
function MiniDotMap({ mask, lat, lng }: { mask: LandMask | null; lat: number; lng: number }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const step = 0.25; // degrees between dots
      const sp = 6; // px between dots
      const cols = Math.ceil(w / sp) + 1;
      const rows = Math.ceil(h / sp) + 1;
      // Snap to the grid so the startup's own dot sits on the canvas centre.
      const lon0 = Math.round(lng / step) * step - (Math.floor(cols / 2) * step);
      const lat0 = Math.round(lat / step) * step + (Math.floor(rows / 2) * step);
      const ox = w / 2 - Math.floor(cols / 2) * sp;
      const oy = h / 2 - Math.floor(rows / 2) * sp;
      const land = new Path2D();
      const sea = new Path2D();
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = ox + c * sp;
          const y = oy + r * sp;
          const p = mask?.isLand(lon0 + c * step, lat0 - r * step) ? land : sea;
          const rad = p === land ? 1.6 : 0.9;
          p.moveTo(x + rad, y);
          p.arc(x, y, rad, 0, Math.PI * 2);
        }
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fill(sea);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill(land);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [mask, lat, lng]);

  return (
    <div className="relative h-56 overflow-hidden sm:h-64">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      {/* Fade the edges into the panel, like the original block's radial gradient. */}
      <div className="absolute inset-0 [background:radial-gradient(circle_at_center,transparent_30%,var(--background)_75%)]" />
      <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_0_4px_rgba(255,255,255,.25)]" />
    </div>
  );
}

/** Round map pin showing the startup's mark (or a plain dot when it has none). */
export function StartupPin({ startup, dotSize }: { startup: Startup; dotSize: number }) {
  if (!startup.icon)
    return (
      <span
        className="relative block rounded-full bg-foreground shadow-[0_0_0_4px_rgba(111,75,47,.9),0_0_0_5px_rgba(255,255,255,.5)] transition-transform group-hover:scale-110"
        style={{ width: dotSize, height: dotSize }}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-foreground/50 [animation-duration:2.4s]" />
      </span>
    );
  return (
    <span className="relative flex size-10 items-center justify-center rounded-full bg-[#2b1b10] shadow-[0_0_0_2px_rgba(255,255,255,.9),0_6px_16px_rgba(0,0,0,.35)] transition-transform group-hover:scale-110 sm:size-11">
      <span className="absolute inset-0 animate-ping rounded-full bg-foreground/30 [animation-duration:2.4s]" />
      <img src={asset(startup.icon)} alt="" className={cn("relative size-[58%]")} />
    </span>
  );
}
