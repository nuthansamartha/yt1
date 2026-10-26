import { Router } from 'express';
import { DownloadController } from '../controllers/downloadController';
import { apiRateLimiter, downloadRateLimiter, statusRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Metadata extraction endpoint (auto-detects video vs playlist)
router.post('/info', apiRateLimiter, DownloadController.getInfo);

// Download job endpoints
router.post('/download', downloadRateLimiter, DownloadController.startDownload);
router.get('/download/status/:jobId', statusRateLimiter, DownloadController.getStatus);
router.delete('/download/:jobId', apiRateLimiter, DownloadController.cancelDownload);
router.get('/download/file/:jobId', DownloadController.getFile);

// Playlist batch download
router.post('/playlist/download', downloadRateLimiter, DownloadController.startPlaylistDownload);

export default router;
