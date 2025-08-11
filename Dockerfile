# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage  
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig*.json ./

# Install TypeScript for server
RUN npm install -g typescript ts-node

EXPOSE 3000

CMD ["npm", "run", "server:ts"] 