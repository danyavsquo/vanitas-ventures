// The live site is served from a sub-path on GitHub Pages (/vanitas-ventures), set at build time
// through NEXT_PUBLIC_BASE_PATH. Next.js adds it to <Link> hrefs on its own; plain asset URLs
// (img src, fetch) must go through asset().
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE_PATH}${path}`;
