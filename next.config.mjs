// BASE_PATH is build-time only in Next.js — it's inlined into the client
// bundle at `next build`. Defaults to '' (root). To deploy under a subpath,
// build with BASE_PATH=/your-prefix.
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
