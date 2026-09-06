import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["192.168.51.2"],
	reactStrictMode: true,
	experimental: {},
	output: "standalone",
	devIndicators: false
};

export default nextConfig;