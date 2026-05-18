// BASE_PATH is build-time only in Next.js — it's inlined into the client
// bundle at `next build`. Defaults to '' (root). To deploy under a subpath,
// build with BASE_PATH=/your-prefix.
const basePath = process.env.BASE_PATH || "";

// `output: 'standalone'` produces .next/standalone/server.js for tiny Docker
// images, but BREAKS `next start` (Next 16 refuses to run start with this set).
// Gate it on BUILD_STANDALONE=true so the Dockerfile turns it on and
// PM2/`next start` deploys (like the author's krytonlabs.com prod) stay
// unaffected.
const output = process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined;

const nextConfig = {
  reactStrictMode: true,
  output,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
