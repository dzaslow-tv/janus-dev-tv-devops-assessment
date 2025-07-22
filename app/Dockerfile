# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript
RUN npx tsc --build --clean && npx tsc

# Stage 2: Production environment
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Set ownership of /app to node user before switching user
RUN chown -R node:node /app

# Switch to non-root user
USER node

ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled files from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Expose port (above 1024)
EXPOSE 3000

# Run the app as node user
CMD ["node", "dist/server.js"]
