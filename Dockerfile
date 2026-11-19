# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ============================================================
# Stage 2: Prisma generate
# ============================================================
FROM deps AS prisma
RUN npx prisma generate

# ============================================================
# Stage 3: Build
# ============================================================
FROM deps AS builder
WORKDIR /app
COPY --from=prisma /app/node_modules/.prisma /app/node_modules/.prisma
COPY . .

RUN npx prisma generate && \
    npm run build

# ============================================================
# Stage 4: Runtime
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set permissions for prerender cache
RUN mkdir .next -p && chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
