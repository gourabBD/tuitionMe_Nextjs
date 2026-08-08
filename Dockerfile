# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Tuition Me — production image.
#
# Builds against Next's `output: "standalone"`, so the runtime stage carries
# only the server bundle and its actually-used dependencies rather than the
# whole node_modules tree.
#
# This image is what makes "runs continuously" portable: the same artifact runs
# on Fly.io, Render, Railway, a VPS or plain Docker Compose as one long-lived
# Node process, with no cold starts.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS base
# libc6-compat covers native modules that expect glibc symbols on Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app


# --- dependencies ----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci


# --- build -----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No database or auth credentials are needed to build: every module reads its
# environment lazily at request time, not at import time.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# --- runtime ---------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Never run the app as root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# The standalone output already contains a minimal node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Fails the container if the process is up but the database is unreachable,
# so an orchestrator restarts or reroutes instead of serving broken pages.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
