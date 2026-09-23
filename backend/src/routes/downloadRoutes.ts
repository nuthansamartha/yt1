import { Router } from 'express';
import { DownloadController } from '../controllers/downloadController';
import { apiRateLimiter, downloadRateLimiter, statusRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Metadata extraction endpoint
router.post('/info', apiRateLimiter, DownloadController.getInfo);

// Download job endpoints
router.post('/download', downloadRateLimiter, DownloadController.startDownload);
router.get('/download/status/:jobId', statusRateLimiter, DownloadController.getStatus);
router.delete('/download/:jobId', apiRateLimiter, DownloadController.cancelDownload);
router.get('/download/file/:jobId', DownloadController.getFile);

export default router;
