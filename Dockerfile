# Stage 1: Build React/Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --no-audit
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Express Backend
FROM node:20-alpine AS backend-builder
WORKDIR /backend
COPY backend/package*.json backend/tsconfig.json ./
RUN npm install --no-audit
COPY backend/src ./src
RUN npm run build

# Stage 3: Production Runner Container
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies for the backend
COPY backend/package*.json ./
RUN npm install --only=production --no-audit

# Copy compiled backend code and frontend static distribution
COPY --from=backend-builder /backend/dist ./dist
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

# Start the unified API and web server
CMD ["node", "dist/index.js"]
