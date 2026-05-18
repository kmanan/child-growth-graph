# syntax=docker/dockerfile:1.7
# Multi-stage build for Next.js standalone output.
# Final image is ~150 MB, runs as non-root user.

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time configuration (see next.config.mjs and design doc §8.4).
# BASE_PATH defaults to '' (root). Override at build time for subpath mounting:
#   docker build --build-arg BASE_PATH=/childgrowth .
ARG BASE_PATH=""
ENV BASE_PATH=$BASE_PATH

# Enable self-host features by default in the published image:
# localStorage persistence + Baby Buddy CSV export. Override with
# --build-arg NEXT_PUBLIC_ENABLE_TRACKING=false to ship the hosted-mode build.
ARG NEXT_PUBLIC_ENABLE_TRACKING="true"
ENV NEXT_PUBLIC_ENABLE_TRACKING=$NEXT_PUBLIC_ENABLE_TRACKING

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server + static assets only.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
