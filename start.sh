#!/bin/bash
# Start script for Golden Arrow project

echo "🚀 Starting Golden Arrow application..."

# Check if concurrently is installed
if ! npx concurrently --version &> /dev/null; then
  echo "Installing concurrently..."
  npm install -g concurrently
fi

# Check if ts-node is installed
if ! npx ts-node --version &> /dev/null; then
  echo "Installing ts-node..."
  npm install -g ts-node
fi

# Start both servers using concurrently
echo "📦 Starting frontend and backend servers..."
npx concurrently --kill-others -n "SERVER,FRONTEND" -c "blue,green" \
  "node run-server.mjs" \
  "npm run dev"