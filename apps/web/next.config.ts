import "@client-pulse/env/web";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    typedEnv: true,
  },
  serverExternalPackages: [
    "@client-pulse/auth",
    "@client-pulse/env/server",
    "@client-pulse/db",
  ],
};

export default withNextIntl(nextConfig);
