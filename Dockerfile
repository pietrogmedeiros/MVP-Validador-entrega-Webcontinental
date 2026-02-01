### Multi-stage: build front (Vite) e servir estático pelo Express

# Stage 1: build front
FROM node:22-bullseye AS front-builder
WORKDIR /app
COPY front/app/package*.json ./
RUN npm ci
COPY front/app .
RUN npm run build

# Stage 2: deps do backend
FROM node:22-bullseye AS back-deps
WORKDIR /app
COPY back/express/package*.json ./
RUN npm ci --omit=dev

# Stage 3: runtime
FROM node:22-bullseye
WORKDIR /app

# Copia backend
COPY --from=back-deps /app/node_modules ./node_modules
COPY back/express .

# Copia build do front para ser servido como estático
COPY --from=front-builder /app/dist ./public

# Expor porta
ENV PORT=3000
EXPOSE 3000

# Start Express
CMD ["node", "src/server.js"]
