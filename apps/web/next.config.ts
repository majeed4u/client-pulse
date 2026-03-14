import "@client-pulse/env/web";
import type { NextConfig } from "next";

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

export default nextConfig;
