# Frontend Dockerfile
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend dependencies & install
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy frontend source & build
COPY . .
RUN pnpm run build

# Backend Dockerfile
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend dependencies & install
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy backend source & build
COPY backend/ .
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install serve for frontend
RUN npm install -g serve

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app/backend && node dist/index.js &\n\
cd /app/frontend && serve -s dist -l 5173 &\n\
wait' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3001 5173

CMD ["/app/start.sh"]