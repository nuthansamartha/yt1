export interface MediaFormat {
  formatId: string;
  resolution: string;
  height: number | null;
  fps: number | null;
  ext: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats: MediaFormat[];
  availableResolutions: number[]; // Array of heights e.g., [2160, 1080, 720]
}

export interface PlaylistVideoEntry {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  index: number;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  uploader: string;
  thumbnail: string;
  videoCount: number;
  videos: PlaylistVideoEntry[];
}

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
  status: JobStatus;
  progress: number;
  speed?: string;
  eta?: string;
  filename?: string;
  originalTitle?: string;
  downloadUrl?: string;
  error?: string;
  isPlaylist?: boolean;
  totalCount?: number;
  completedCount?: number;
  failedCount?: number;
  remainingCount?: number;
  jobs?: {
    jobId: string;
    videoId: string;
    status: JobStatus;
    progress: number;
    speed?: string;
    eta?: string;
    downloadUrl?: string;
  }[];
}

export interface PlaylistDownloadJob {
  jobId: string;
  videoId: string;
  title: string;
  thumbnail: string;
  status: JobStatus;
  progress: number;
  speed?: string;
  eta?: string;
  downloadUrl?: string;
  error?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  format: 'mp4' | 'mp3';
  quality: string;
  timestamp: number;
  downloadUrl: string;
}
