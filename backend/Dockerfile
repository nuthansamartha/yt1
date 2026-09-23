FROM node:20-alpine

# Install python3, ffmpeg, and yt-dlp
RUN apk add --no-cache \
    python3 \
    ffmpeg \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/

RUN npm run build

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DOWNLOAD_DIR=./downloads

CMD ["node", "dist/server.js"]
