import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Redirección a nivel routing (no renderiza una página): evita el redirect() en el
  // prerender que Next 16 marca como issue con cacheComponents activado.
  async redirects() {
    return [{ source: "/", destination: "/productos", permanent: false }];
  },
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
