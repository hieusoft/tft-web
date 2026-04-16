# ─────────────────────────────────────────────
# Stage 1: deps — cài node modules
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Cài production + dev dependencies (cần devDeps để build TypeScript)
RUN npm ci

# ─────────────────────────────────────────────
# Stage 2: builder — build Next.js app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy toàn bộ source code
COPY . .

# Tắt Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build production bundle
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: runner — image chạy production
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo user không phải root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy các file cần thiết từ builder
COPY --from=builder /app/public ./public

# Standalone output giúp giảm kích thước image đáng kể
# (cần bật output: 'standalone' trong next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
