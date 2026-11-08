import type { SocialItem } from "@/components/ui/social-media";
import { asset } from "@/lib/base-path";

// TODO: replace the placeholder email address.
export const socialLinks: SocialItem[] = [
  {
    href: "https://t.me/daniilzvyagin",
    ariaLabel: "Telegram",
    tooltip: "Telegram",
    color: "#0088cc",
    svgUrl: asset("/icons/telegram.svg?v=2"),
  },
  {
    href: "https://www.instagram.com/daniil.zvyagin/",
    ariaLabel: "Instagram",
    tooltip: "Instagram",
    color: "#E4405F",
    svgUrl: asset("/icons/instagram.svg?v=2"),
  },
  {
    href: "mailto:hello@example.com",
    ariaLabel: "Email",
    tooltip: "Email",
    color: "#6b7280",
    svgUrl: asset("/icons/email.svg?v=2"),
  },
  {
    href: "https://www.linkedin.com/in/daniil-zvyagin/",
    ariaLabel: "LinkedIn",
    tooltip: "LinkedIn",
    color: "#0A66C2",
    svgUrl: asset("/icons/linkedin.svg?v=2"),
  },
];
