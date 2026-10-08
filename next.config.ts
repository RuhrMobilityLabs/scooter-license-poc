import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Frontend-only PoC: build as a static site (no server/backend)
  output: "export",
  // Set by the GitHub Pages workflow, e.g. "/scooter-license"; empty for local builds
  basePath: process.env.BASE_PATH || undefined,
  // Emit <route>/index.html so static hosts like GitHub Pages resolve every route
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
