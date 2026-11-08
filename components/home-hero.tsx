"use client";

import * as React from "react";
import DotMatrixText from "@/components/ui/dot-text";
import { inter } from "@/lib/fonts";

// Smaller dots on phones so the long phrases stay legible at narrow widths.
function useIsNarrow() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

export function HomeHero() {
  const narrow = useIsNarrow();

  return (
    <DotMatrixText
      text={["Vanitas Ventures", "Work in Progress"]}
      transition="fade"
      cycleInterval={3000}
      dotSize={narrow ? 2 : 4}
      gap={narrow ? 1.2 : 2.5}
      activeColor="#ffffff"
      showInactive={false}
      fontFamily={inter.style.fontFamily}
      className="w-full h-full"
      aria-hidden="true"
    />
  );
}
