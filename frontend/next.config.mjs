const apiProxyTarget = process.env.API_PROXY_TARGET;
const proxiedPaths = ["/api", "/socket.io", "/media", "/uploads"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];
    const { origin } = new URL(apiProxyTarget);
    return proxiedPaths.map((path) => ({
      source: `${path}/:path*`,
      destination: `${origin}${path}/:path*`,
    }));
  },
  cacheComponents: true,
  partialPrefetching: true,
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
