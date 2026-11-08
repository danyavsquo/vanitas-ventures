import type { Metadata } from "next";
import { SocialTooltip } from "@/components/ui/social-media";
import { socialLinks } from "@/lib/socials";

export const metadata: Metadata = { title: "Contact — Vanitas Ventures" };

export default function ContactPage() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-background px-6">
      <h1 className="sr-only">Contact Vanitas Ventures</h1>
      {/* Enlarge the circles and icons without touching the shared component */}
      <SocialTooltip
        items={socialLinks}
        className="flex-wrap gap-6 sm:gap-10 [&_a]:h-16 [&_a]:w-16 sm:[&_a]:h-24 sm:[&_a]:w-24 [&_img]:h-9 [&_img]:w-9 sm:[&_img]:h-14 sm:[&_img]:w-14"
      />
    </main>
  );
}
