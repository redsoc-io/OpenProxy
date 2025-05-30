# Build stage
FROM node:20-alpine AS builder
LABEL maintainer="@midhunvnadh"

WORKDIR /usr/src/app

# Copy package files and configs
COPY package*.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Install ALL dependencies (including dev deps) for build
RUN npm ci

# Copy source files
COPY src ./src
COPY public ./public

# Build the application
RUN npm run build && npm prune --production

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy only necessary files from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src

# Set environment variable
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
