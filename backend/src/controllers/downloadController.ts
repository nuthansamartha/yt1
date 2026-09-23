import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateYouTubeUrl } from '../utils/validateUrl';
import { YtdlpService } from '../services/ytdlpService';
import { JobManager } from '../services/jobManager';
import { sanitizeFilename } from '../utils/sanitizeFilename';
import { FileService } from '../services/fileService';
import fs from 'fs';

export class DownloadController {
  /**
   * POST /api/info
   * Analyzes YouTube video and returns metadata & formats
   */
  public static async getInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ success: false, error: 'URL is required' });
        return;
      }

      const validation = validateYouTubeUrl(url);
      if (!validation.isValid || !validation.sanitizedUrl) {
        res.status(400).json({ success: false, error: validation.error || 'Invalid YouTube URL' });
        return;
      }

      const videoInfo = await YtdlpService.getVideoInfo(validation.sanitizedUrl);

      res.json({
        success: true,
        video: videoInfo
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Unable to retrieve video information'
      });
    }
  }

  /**
   * POST /api/download
   * Starts a background download job
   */
  public static async startDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, format, quality } = req.body;

      if (!url) {
        res.status(400).json({ success: false, error: 'URL is required' });
        return;
      }

      const validation = validateYouTubeUrl(url);
      if (!validation.isValid || !validation.sanitizedUrl) {
        res.status(400).json({ success: false, error: validation.error || 'Invalid YouTube URL' });
        return;
      }

      const mediaFormat = format === 'mp3' ? 'mp3' : 'mp4';
      const requestedQuality = quality || 'best';

      // Metadata was already fetched during /api/info; skip re-fetching here so
      // the job starts immediately (re-fetching doubled the startup latency and
      // could fail a download that analysis just succeeded on).
      const jobId = uuidv4();
      const job = JobManager.createJob(jobId, validation.sanitizedUrl, mediaFormat, requestedQuality);
      JobManager.updateJob(jobId, { status: 'fetching' });

      // Start background yt-dlp child process
      const handle = YtdlpService.startDownloadProcess(
        jobId,
        validation.sanitizedUrl,
        mediaFormat,
        requestedQuality,
        (progress, statusMsg, speed, eta) => {
          JobManager.updateJob(jobId, {
            progress,
            status: statusMsg as any,
            speed,
            eta
          });
        },
        (filename, filepath) => {
          // yt-dlp doesn't give us the title here (no metadata round-trip),
          // so reuse the original video title for the friendly filename.
          const currentJob = JobManager.getJob(jobId);
          JobManager.updateJob(jobId, {
            status: 'completed',
            progress: 100,
            filename,
            filepath,
            originalTitle: currentJob?.originalTitle || 'youtube_video',
            speed: undefined,
            eta: undefined
          });
        },
        (errorMsg) => {
          JobManager.failJob(jobId, errorMsg);
        }
      );

      JobManager.updateJob(jobId, { processKillHandle: handle.kill });

      res.status(202).json({
        success: true,
        jobId
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to initiate download job'
      });
    }
  }

  /**
   * GET /api/download/status/:jobId
   * Polling endpoint for job status and progress percentage
   */
  public static getStatus(req: Request, res: Response, next: NextFunction): void {
    const { jobId } = req.params;
    const job = JobManager.getJob(jobId);

    if (!job) {
      res.status(404).json({ success: false, error: 'Download job not found or expired' });
      return;
    }

    const downloadUrl = job.status === 'completed' ? `/api/download/file/${job.id}` : undefined;

    res.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      speed: job.speed,
      eta: job.eta,
      filename: job.filename,
      originalTitle: job.originalTitle,
      downloadUrl,
      error: job.error
    });
  }

  /**
   * DELETE /api/download/:jobId
   * Cancels an ongoing download job
   */
  public static cancelDownload(req: Request, res: Response, next: NextFunction): void {
    const { jobId } = req.params;
    const cancelled = JobManager.cancelJob(jobId);

    if (!cancelled) {
      res.status(404).json({ success: false, error: 'Job not found or already terminated' });
      return;
    }

    res.json({ success: true, message: 'Download job cancelled successfully' });
  }

  /**
   * GET /api/download/file/:jobId
   * Streams the completed download file to the user
   */
  public static getFile(req: Request, res: Response, next: NextFunction): void {
    const { jobId } = req.params;
    const job = JobManager.getJob(jobId);

    if (!job || job.status !== 'completed' || !job.filepath) {
      res.status(404).json({ success: false, error: 'Download file not available or job expired' });
      return;
    }

    if (!fs.existsSync(job.filepath)) {
      res.status(404).json({ success: false, error: 'File was removed from server storage' });
      return;
    }

    const ext = job.format === 'mp3' ? 'mp3' : 'mp4';
    const userFriendlyName = sanitizeFilename(job.originalTitle || 'youtube_video', ext);

    res.download(job.filepath, userFriendlyName, (err) => {
      if (err) {
        console.error(`[DownloadController] File transfer error for job ${jobId}:`, err);
      } else {
        console.log(`[DownloadController] Successfully delivered download file for job ${jobId}`);
      }
    });
  }
}
