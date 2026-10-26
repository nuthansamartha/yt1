import { VideoInfo, PlaylistInfo, DownloadJob } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Safely parse a fetch Response as JSON.
 * If the body is empty or non-JSON (e.g. HTML error page from a proxy),
 * return an object instead of "Unexpected end of JSON input".
 */
async function safeJson(response: Response): Promise<any> {
  const text = await response.text();
  if (!text || !text.trim()) {
    return { success: false, error: `Server returned an empty response (HTTP ${response.status})` };
  }
  try {
    return JSON.parse(text);
  } catch {
    // Truncate long HTML bodies for readability
    const preview = text.length > 200 ? text.slice(0, 200) + '…' : text;
    return { success: false, error: `Invalid response from server: ${preview}` };
  }
}

async function requestApi(url: string, options?: RequestInit): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (err: any) {
    throw new ApiError(
      'Unable to connect to the backend server. Please verify the backend is running on port 5000.',
      0
    );
  }

  const data = await safeJson(response);
  if (!response.ok || !data.success) {
    throw new ApiError(data.error || 'Server returned an error', response.status);
  }
  return data;
}

/** Analyze a URL — the backend auto-detects whether it's a video or playlist.
 * Returns { type: 'video', video: VideoInfo } or { type: 'playlist', playlist: PlaylistInfo }
 */
export async function analyzeUrl(
  url: string
): Promise<{ type: 'video'; video: VideoInfo } | { type: 'playlist'; playlist: PlaylistInfo }> {
  const data = await requestApi(`${API_BASE_URL}/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });

  if (data.type === 'playlist') {
    return { type: 'playlist', playlist: data.playlist };
  }

  return { type: 'video', video: data.video || data };
}

/** @deprecated Use analyzeUrl instead */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const result = await analyzeUrl(url);
  if (result.type === 'video') {
    return result.video;
  }
  throw new ApiError('Expected a video URL but got a playlist', 400);
}

export async function startDownload(
  url: string,
  format: 'mp4' | 'mp3',
  quality: number | string
): Promise<{ jobId: string }> {
  const data = await requestApi(`${API_BASE_URL}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, format, quality })
  });

  return { jobId: data.jobId };
}

/** Start batch download for selected playlist videos.
 * Returns an array of { jobId, videoId } pairs.
 */
export async function startBatchDownload(
  videoIds: string[],
  format: 'mp4' | 'mp3',
  quality: number | string
): Promise<{ jobId: string; videoId: string }[]> {
  const data = await requestApi(`${API_BASE_URL}/playlist/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ videoIds, format, quality })
  });

  return data.jobs || [];
}

export async function getDownloadStatus(jobId: string): Promise<DownloadJob> {
  const data = await requestApi(`${API_BASE_URL}/download/status/${encodeURIComponent(jobId)}`);

  const serverUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const downloadUrl = data.downloadUrl
    ? `${serverUrl}${data.downloadUrl.startsWith('/') ? '' : '/'}${data.downloadUrl}`
    : undefined;

  return {
    id: data.jobId || jobId,
    status: data.status,
    progress: data.progress ?? 0,
    speed: data.speed,
    eta: data.eta,
    filename: data.filename,
    originalTitle: data.originalTitle,
    downloadUrl,
    error: data.error
  };
}

export async function cancelDownload(jobId: string): Promise<void> {
  await requestApi(`${API_BASE_URL}/download/${encodeURIComponent(jobId)}`, {
    method: 'DELETE'
  });
}

export function getDownloadFileUrl(jobId: string): string {
  const serverUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return `${serverUrl}/api/download/file/${encodeURIComponent(jobId)}`;
}