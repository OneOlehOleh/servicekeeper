import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
  poweredByHeader: false,
};

export default config;
