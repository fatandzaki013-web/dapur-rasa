import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Hilangkan indikator dev di pojok kiri bawah */
  devIndicators: false,
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
