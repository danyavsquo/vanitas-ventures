import type { NextConfig } from "next";

// Static export for GitHub Pages. Locally NEXT_PUBLIC_BASE_PATH is unset, so the site runs at /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
