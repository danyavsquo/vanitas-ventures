import type { Metadata } from "next";
import {
  BookOpen,
  Camera,
  Compass,
  Feather,
  Globe,
  Lightbulb,
  Mic,
  Newspaper,
  NotebookPen,
  PenLine,
  Quote,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

export const metadata: Metadata = { title: "Blog — Vanitas Ventures" };

// Desktop mosaic: three different 3x3 arrangements, stacked. Written out in full
// so Tailwind can see every class.
const layout = [
  // rows 1–3: tall centre, pairs stacked left and right
  "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4",
  "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4",
  // rows 4–6: wide card top-left, tall card right, small cards below
  "lg:col-start-1 lg:col-end-3 lg:row-start-4 lg:row-end-5",
  "lg:col-start-3 lg:col-end-4 lg:row-start-4 lg:row-end-7",
  "lg:col-start-1 lg:col-end-2 lg:row-start-5 lg:row-end-7",
  "lg:col-start-2 lg:col-end-3 lg:row-start-5 lg:row-end-6",
  "lg:col-start-2 lg:col-end-3 lg:row-start-6 lg:row-end-7",
  // rows 7–9: tall card left, wide card top-right, mixed below
  "lg:col-start-1 lg:col-end-2 lg:row-start-7 lg:row-end-10",
  "lg:col-start-2 lg:col-end-4 lg:row-start-7 lg:row-end-8",
  "lg:col-start-2 lg:col-end-3 lg:row-start-8 lg:row-end-10",
  "lg:col-start-3 lg:col-end-4 lg:row-start-8 lg:row-end-9",
  "lg:col-start-3 lg:col-end-4 lg:row-start-9 lg:row-end-10",
];

const icons = [
  Newspaper, PenLine, Lightbulb, BookOpen, Feather,
  Rocket, NotebookPen, Quote, Compass, TrendingUp,
  Globe, Sparkles, Mic, Camera, Users,
];

// Article placeholders: swap name, description and href when a post is written.
const articles = layout.map((className, i) => ({
  Icon: icons[i],
  className,
  name: "Work in Progress",
  description: "Work in progress",
  href: "#",
  cta: "Work in progress",
  background: null,
}));

// Restyle the white demo cards for the brown theme without editing the component.
const cardTheme =
  "bg-white/[0.06] backdrop-blur-[2px] [box-shadow:0_0_0_1px_rgba(255,255,255,.12),0_12px_24px_rgba(0,0,0,.12)] text-white [&_svg]:text-white/85 [&_h3]:text-white [&_p]:text-white/70";

export default function BlogPage() {
  // The page body is locked (globals.css), so this page scrolls inside its own container.
  return (
    <main className="h-dvh overflow-y-auto overscroll-contain bg-background dot-texture px-4 pb-10 pt-20 sm:px-6 sm:pt-24">
      <h1 className="sr-only">Blog — Work in Progress</h1>
      <BentoGrid className="mx-auto max-w-6xl auto-rows-[11rem] gap-3 lg:auto-rows-[13rem] lg:gap-4">
        {articles.map((article, i) => (
          <BentoCard key={i} {...article} className={`${article.className} ${cardTheme}`} />
        ))}
      </BentoGrid>
    </main>
  );
}
