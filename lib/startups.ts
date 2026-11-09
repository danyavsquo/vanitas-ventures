// Startups shown on /map. Add one object per startup.
// lat / lng are decimal degrees: in Google Maps, right-click a place and click the
// numbers at the top of the menu to copy them (first number is lat, second is lng).
// North and east are positive, south and west are negative.
// Only name, lat and lng are required; every other field adds a section to the popup.
// Logos go in public/startups/ and are referenced as "/startups/<file>".
export type Startup = {
  name: string;
  lat: number;
  lng: number;
  /** Shown under the name, e.g. "Vienna, Austria". */
  location?: string;
  /** Flag emoji for the location pill on the popup's mini map. */
  flag?: string;
  /** Website; the popup shows a "Visit" button when set. */
  href?: string;
  /** Square, white-on-transparent mark shown inside the map pin. */
  icon?: string;
  /** White wordmark shown at the top of the popup. */
  logo?: string;
  /** Short paragraph about the company. */
  description?: string;
  /** One-line pitch, set large. */
  headline?: string;
  /** A highlight block: label above, big text, small caption. */
  highlight?: { label: string; title: string; text?: string };
  /** A short illustrative exchange shown as chat bubbles. */
  chat?: { from: "user" | "agent"; text: string }[];
  /** A big number or phrase across the full width, e.g. { value: "50+", label: "tools" }. */
  stat?: { value: string; label: string };
  /** "How it works" steps. */
  steps?: { title: string; text: string }[];
  /** Feature names shown as small pills. */
  features?: string[];
  /** Other places the team works from (shown under the mini map). */
  offices?: string[];
};

export const startups: Startup[] = [
  {
    // Copy taken from https://mazed.ai (November 2026).
    name: "Mazed",
    lat: 48.2082,
    lng: 16.3738,
    location: "Vienna, Austria",
    flag: "🇦🇹",
    href: "https://mazed.ai",
    icon: "/startups/mazed-mark.svg",
    logo: "/startups/mazed-logo.svg",
    headline: "Build AI agents across voice and video calls.",
    description:
      "Mazed is a multimodal agent platform. Bring any LLM, connect your knowledge base and tools, and build flows for customer service and business operations — then deploy one agent to phone, web or video with no code required.",
    highlight: {
      label: "Multimodal by design",
      title: "One agent across telephony, web and embedded apps — voice, video and text.",
      text: "When a conversation needs a person, the agent escalates to a live agent or phone number.",
    },
    chat: [
      { from: "user", text: "Can I speak to someone from the team?" },
      { from: "agent", text: "Of course — I'm handing you over to a colleague now." },
    ],
    stat: { value: "50+ tools", label: "Pre-built connectors for your CRM, helpdesk, calendar and more" },
    steps: [
      {
        title: "Design your agent",
        text: "Build conversation flows visually in Agent Canvas, connect knowledge bases and define behaviours.",
      },
      { title: "Integrate your stack", text: "Connect your CRM, helpdesk, calendar and other tools." },
      { title: "Go live instantly", text: "Deploy to phone, web or video — no code required." },
    ],
    features: [
      "Knowledge retrieval",
      "Persistent memory",
      "Native actions",
      "Multi-agent orchestration",
      "Human handoff",
      "Adaptive behaviours",
      "Customer service",
      "Sales",
      "Recruiting",
      "Learning & development",
    ],
    offices: ["Vienna", "San Francisco"],
  },
];
