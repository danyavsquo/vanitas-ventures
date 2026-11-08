// Startups shown on /map. Add one object per startup.
// lat / lng are decimal degrees: in Google Maps, right-click a place and click the
// numbers at the top of the menu to copy them (first number is lat, second is lng).
// North and east are positive, south and west are negative.
export type Startup = {
  name: string;
  lat: number;
  lng: number;
  /** Shown under the name, e.g. "Berlin, Germany". */
  location?: string;
  description?: string;
  /** Website; the card shows a "Visit" link when set. */
  href?: string;
};

export const startups: Startup[] = [
  // {
  //   name: "Example Startup",
  //   lat: 52.52,
  //   lng: 13.405,
  //   location: "Berlin, Germany",
  //   description: "One line about what it does.",
  //   href: "https://example.com",
  // },
];
