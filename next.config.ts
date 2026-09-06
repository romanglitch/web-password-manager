import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ['*'],
	reactStrictMode: true,
	// Ensure Node.js runtime is used for API routes (for in-memory store)
	experimental: {},
	output: "standalone",
};

export default nextConfig;