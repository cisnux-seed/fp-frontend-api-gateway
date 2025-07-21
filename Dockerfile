#
# CATATAN UNTUK PENGEMBANG:
# File ini adalah "resep" untuk membangun gambar produksi dari aplikasi Next.js Anda.
# Ini TIDAK digunakan selama pengembangan lokal (saat Anda menjalankan `npm run dev`).
# Anda hanya akan menggunakan file ini saat Anda siap untuk men-deploy aplikasi Anda ke server.
# Untuk menjalankan database lokal, lihat file `docker-compose.yml`.
#

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Prune unnecessary deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Stage 3: Final lean image
FROM alpine:latest AS runner
WORKDIR /app

# Install just Node runtime (no npm/yarn)
RUN apk add --no-cache nodejs

ENV NODE_ENV=production 

# Copy essential build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start"]
