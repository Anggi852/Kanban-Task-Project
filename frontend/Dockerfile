# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM docker.io/oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM docker.io/oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NUXT_PUBLIC_API_BASE is baked into the client bundle at build time.
# Pass it via --build-arg and set as env var so Nuxt picks it up.
ARG NUXT_PUBLIC_API_BASE=/api
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

RUN bun run build

# ─── Stage 3: Production ──────────────────────────────────────────────────────
# Nuxt SSR output is self-contained in .output/ — no node_modules needed.
FROM docker.io/node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output ./

# Nuxt SSR server listens on HOST:PORT
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.mjs"]
