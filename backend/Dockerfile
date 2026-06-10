# Use a small, official Node.js image (Alpine = minimal Linux)
FROM node:20-alpine

# All app commands run from /app inside the container
WORKDIR /app

# Copy dependency manifests first — Docker caches this layer until they change
COPY package.json package-lock.json ./

# Install only production dependencies (no nodemon, etc.)
RUN npm ci --omit=dev

# Copy application source (respects .dockerignore)
COPY . .

# express-fileupload writes uploads to ./tmp — ensure it exists and is writable
RUN mkdir -p tmp && chown -R node:node /app

# Run as non-root user for security
USER node

ENV NODE_ENV=production

# Default port from your .env; override at runtime if needed
EXPOSE 5001

CMD ["npm", "start"]
