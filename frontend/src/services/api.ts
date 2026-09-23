import { VideoInfo, DownloadJob } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Safely parse a fetch Response as JSON.
 * If the body is empty or non-JSON (e.g. HTML error page from a proxy),
 * return a fallback object instead of crashing with "Unexpected end of JSON input".
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

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const data = await requestApi(`${API_BASE_URL}/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });

  return data.video;
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

export async function getDownloadStatus(jobId: string): Promise<DownloadJob> {
  const data = await requestApi(`${API_BASE_URL}/download/status/${encodeURIComponent(jobId)}`);

  return {
    id: data.jobId,
    status: data.status,
    progress: data.progress,
    speed: data.speed,
    eta: data.eta,
    filename: data.filename,
    originalTitle: data.originalTitle,
    downloadUrl: data.downloadUrl ? `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}${data.downloadUrl}` : undefined,
    error: data.error
  };
}

export async function cancelDownload(jobId: string): Promise<void> {
  await requestApi(`${API_BASE_URL}/download/${encodeURIComponent(jobId)}`, {
    method: 'DELETE'
  });
}

export function getDownloadFileUrl(jobId: string): string {
  return `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/download/file/${encodeURIComponent(jobId)}`;
}
