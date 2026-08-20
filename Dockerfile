# ============================================================
#  VirtuLab Kenya — Production Multi-Stage Dockerfile
# ============================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: run as non-root user
USER node

# Copy dependencies and source code
COPY --chown=node:node --from=dependencies /app/server/node_modules ./server/node_modules
COPY --chown=node:node server/ ./server/
COPY --chown=node:node client/ ./client/
COPY --chown=node:node docs/ ./docs/
COPY --chown=node:node README.md ./

WORKDIR /app/server

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "index.js"]
