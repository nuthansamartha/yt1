FROM node:20-alpine

# Install system dependencies: Python 3, pip, FFmpeg, curl, ca-certs.
# --no-cache prevents apk from using a stale local index, ensuring fresh packages.
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    ca-certificates

# Install yt-dlp via pip into a dedicated virtual environment.
# Using venv avoids PEP 668 "externally-managed-environment" errors on newer Alpine.
# Running pip install --upgrade on every build ensures the latest stable yt-dlp.
# Unlike the curl-to-binary approach, pip does not get stale from Docker layer caching
# because the RUN instruction content hasn't changed — but we force a fresh install
# each time via --no-cache-dir and --upgrade.
RUN python3 -m venv /opt/yt-dlp-env \
    && /opt/yt-dlp-env/bin/pip install --no-cache-dir --upgrade yt-dlp

# Expose the yt-dlp binary on PATH via a symlink to the venv binary.
RUN ln -sf /opt/yt-dlp-env/bin/yt-dlp /usr/local/bin/yt-dlp

# Sanity check: both binaries must be functional at build time.
# If either command fails, the Docker build aborts here — surfacing the error
# at build time rather than silently at runtime.
RUN echo "--- Build-time dependency verification ---" \
    && yt-dlp --version \
    && ffmpeg -version 2>&1 | head -1 \
    && echo "--- All dependencies verified OK ---"

# Set working directory
WORKDIR /app

# Install Node.js dependencies (package files in a separate layer for caching)
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy application source code and build TypeScript
COPY src/ ./src/
RUN npm run build

# Create download directory
RUN mkdir -p /app/downloads

# Configure environment defaults (overridden by Render env vars at runtime)
ENV NODE_ENV=production
ENV PORT=5000
ENV DOWNLOAD_DIR=/app/downloads

EXPOSE 5000

# Log the live yt-dlp version on container startup, then start the Node server.
# This makes it immediately visible in Render logs whether yt-dlp is up-to-date.
CMD ["sh", "-c", "echo \"[Startup] yt-dlp version: $(yt-dlp --version)\" && node dist/server.js"]
