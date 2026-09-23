import { FileService } from './fileService';

export type JobStatus =
  | 'queued'
  | 'fetching'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export interface DownloadJob {
  id: string;
  url: string;
  format: 'mp4' | 'mp3';
  quality: number | string;
  status: JobStatus;
  progress: number;
  speed?: string;
  eta?: string;
  filename?: string;
  filepath?: string;
  originalTitle?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  processKillHandle?: () => void;
}

export class JobManager {
  private static jobs: Map<string, DownloadJob> = new Map();

  public static createJob(
    id: string,
    url: string,
    format: 'mp4' | 'mp3',
    quality: number | string
  ): DownloadJob {
    const now = Date.now();
    const job: DownloadJob = {
      id,
      url,
      format,
      quality,
      status: 'queued',
      progress: 0,
      createdAt: now,
      updatedAt: now
    };

    this.jobs.set(id, job);
    console.log(`[JobManager] Job created: ${id} (${format}, ${quality})`);
    return job;
  }

  public static getJob(id: string): DownloadJob | undefined {
    return this.jobs.get(id);
  }

  public static updateJob(id: string, updates: Partial<DownloadJob>): DownloadJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    Object.assign(job, updates, { updatedAt: Date.now() });
    this.jobs.set(id, job);
    return job;
  }

  public static failJob(id: string, error: string): void {
    const job = this.jobs.get(id);
    if (job) {
      if (job.processKillHandle) {
        job.processKillHandle();
      }
      this.updateJob(id, {
        status: 'failed',
        error,
        progress: 0,
        speed: undefined,
        eta: undefined
      });
      console.error(`[JobManager] Job failed: ${id} - ${error}`);
    }
  }

  public static cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.processKillHandle) {
      job.processKillHandle();
    }

    if (job.filepath) {
      FileService.deleteFile(job.filepath);
    }

    this.updateJob(id, {
      status: 'failed',
      error: 'Download job was cancelled by user',
      progress: 0,
      speed: undefined,
      eta: undefined
    });
    console.log(`[JobManager] Job cancelled by user: ${id}`);
    return true;
  }

  public static deleteJob(id: string): void {
    const job = this.jobs.get(id);
    if (job) {
      if (job.filepath) {
        FileService.deleteFile(job.filepath);
      }
      if (job.processKillHandle) {
        job.processKillHandle();
      }
      this.jobs.delete(id);
      console.log(`[JobManager] Job deleted and cleaned: ${id}`);
    }
  }

  /**
   * Cleanup jobs older than expirationMinutes.
   * Jobs with a running download process are never cleaned up, no matter how old —
   * deleting them mid-download would kill an in-flight transfer and remove its file.
   */
  public static cleanupExpiredJobs(expirationMinutes: number = 30): void {
    const now = Date.now();
    const maxAgeMs = expirationMinutes * 60 * 1000;
    const activeStatuses: JobStatus[] = ['queued', 'fetching', 'downloading', 'processing'];

    for (const [id, job] of this.jobs.entries()) {
      if (activeStatuses.includes(job.status)) continue;
      if (now - job.createdAt > maxAgeMs) {
        console.log(`[JobManager] Cleaning expired job: ${id}`);
        this.deleteJob(id);
      }
    }
  }
}
