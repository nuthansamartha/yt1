import app from './app';
import dotenv from 'dotenv';
import { YtdlpService } from './services/ytdlpService';
import { FileService } from './services/fileService';
import { JobManager } from './services/jobManager';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const JOB_EXPIRATION_MINUTES = parseInt(process.env.JOB_EXPIRATION_MINUTES || '30', 10);

// Initialize directories and check binary dependencies
FileService.ensureDownloadDir();
console.log('[Server] Initializing system dependency checks...');
const deps = YtdlpService.checkDependencies();

if (deps.ytdlp && deps.ffmpeg) {
  console.log('✅ [Server] All backend dependencies (`yt-dlp` and `ffmpeg`) are detected and ready.');
} else {
  console.warn('⚠️ [Server] Missing dependencies detected:');
  if (!deps.ytdlp) console.warn('   - yt-dlp is missing from PATH');
  if (!deps.ffmpeg) console.warn('   - ffmpeg is missing from PATH');
  console.warn('   Please refer to README.md for installation instructions.');
}

// Periodic cleanup of expired jobs and files (runs every 5 minutes)
setInterval(() => {
  JobManager.cleanupExpiredJobs(JOB_EXPIRATION_MINUTES);
  FileService.cleanupOldFiles(JOB_EXPIRATION_MINUTES);
}, 5 * 60 * 1000);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Server] YouTube Downloader Backend running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/health`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [Server] Port ${PORT} is already in use.`);
    console.error(`   Run this command to free it, then restart:`);
    console.error(`   powershell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

