const apiProxyTarget = process.env.API_PROXY_TARGET;
const proxiedPaths = ["/api", "/media", "/uploads"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];
    const { origin } = new URL(apiProxyTarget);
    return [
      // Next.js serves the browser URL without a slash. Engine.IO expects it upstream.
      { source: "/socket.io", destination: `${origin}/socket.io/` },
      ...proxiedPaths.map((path) => ({
        source: `${path}/:path*`,
        destination: `${origin}${path}/:path*`,
      })),
    ];
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
