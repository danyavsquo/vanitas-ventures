import type { Metadata } from "next";
import { StartupMap } from "@/components/startup-map";

export const metadata: Metadata = { title: "Map — Vanitas Ventures" };

export default function MapPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <h1 className="sr-only">Map of Vanitas Ventures startups</h1>
      <StartupMap />
    </main>
  );
}
