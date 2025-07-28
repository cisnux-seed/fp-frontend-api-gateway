# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# ===== Tambahkan build args untuk env =====
ARG JWT_SECRET
ARG NEXT_PUBLIC_APP_URL

# ===== Tambahkan ke ENV saat build (khusus Next.js saat build-time) =====
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# ==========================================

COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY . .

RUN npm install
RUN npm run build

# Stage 2: Final image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# ====== Tambahkan ENV juga di image final (opsional) =====
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

EXPOSE 3000

CMD ["npm", "start"]
