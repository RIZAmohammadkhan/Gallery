# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create environment file for build
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG GEMINI_API_KEY
ARG MONGODB_URI
ARG MAX_FILE_SIZE
ARG APP_NAME
ARG APP_URL

RUN echo "NEXTAUTH_URL=${NEXTAUTH_URL}" > .env.local && \
    echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" >> .env.local && \
    echo "GEMINI_API_KEY=${GEMINI_API_KEY}" >> .env.local && \
    echo "MONGODB_URI=${MONGODB_URI}" >> .env.local && \
    echo "MAX_FILE_SIZE=${MAX_FILE_SIZE}" >> .env.local && \
    echo "APP_NAME=${APP_NAME}" >> .env.local && \
    echo "APP_URL=${APP_URL}" >> .env.local

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy environment file
COPY --from=builder /app/.env.local ./

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
