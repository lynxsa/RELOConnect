# Multi-service Dockerfile for Auth Service
FROM node:18-alpine@sha256:1d7b2f8c1e2e9e3e6e4e2d6e6e2e9e3e6e4e2d6e6e2e9e3e6e4e2d6e6e2e9e3e

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY ../../libs/shared ./libs/shared

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["pnpm", "start"]
