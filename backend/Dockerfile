```dockerfile
FROM node:20-alpine

# Install Python, FFmpeg, and dependencies
RUN apk add --no-cache \
    python3 \
    ffmpeg \
    curl \
    ca-certificates

# Install yt-dlp
RUN curl -fL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy application source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Create download directory
RUN mkdir -p /app/downloads

# Configure environment
ENV NODE_ENV=production
ENV PORT=5000
ENV DOWNLOAD_DIR=/app/downloads

EXPOSE 5000

# Start backend
CMD ["node", "dist/server.js"]
```
