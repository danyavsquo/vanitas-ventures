import { HomeHero } from "@/components/home-hero";

export default function Home() {
  return (
    <main className="relative w-full h-dvh bg-background dot-texture flex items-center justify-center overflow-hidden select-none">
      {/* Dot matrix typography stage */}
      <div className="relative z-10 w-full max-w-5xl px-6 h-56 md:h-80 flex items-center justify-center">
        <h1 className="sr-only">Vanitas Ventures — Work in Progress</h1>
        <HomeHero />
      </div>
    </main>
  );
}
