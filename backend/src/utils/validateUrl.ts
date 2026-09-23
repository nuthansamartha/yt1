/**
 * Utility for validating user-provided YouTube URLs.
 * Enforces security restrictions against SSRF and command injection.
 */

const ALLOWED_HOSTNAMES = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com'
]);

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
  videoId?: string;
}

export function validateYouTubeUrl(inputUrl: string): UrlValidationResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { isValid: false, error: 'URL is required and must be a string' };
  }

  const trimmed = inputUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Reject non-HTTP(S) protocols
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTP and HTTPS YouTube URLs are supported' };
  }

  // Normalize hostname
  const hostname = parsed.hostname.toLowerCase();

  // Explicit security checks against localhost/IPs/internal networks
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { isValid: false, error: 'Local/Internal network addresses are strictly prohibited' };
  }

  if (!ALLOWED_HOSTNAMES.has(hostname)) {
    return { isValid: false, error: 'Only supported YouTube domains are allowed (youtube.com, youtu.be)' };
  }

  let videoId: string | null = null;

  if (hostname === 'youtu.be') {
    // Format: https://youtu.be/VIDEO_ID
    const pathname = parsed.pathname.slice(1);
    if (pathname.length > 0) {
      videoId = pathname.split('/')[0].split('?')[0];
    }
  } else {
    // Format: https://www.youtube.com/watch?v=VIDEO_ID or /shorts/VIDEO_ID or /embed/VIDEO_ID
    if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/shorts/')) {
      const parts = parsed.pathname.split('/');
      videoId = parts[2] || null;
    } else if (parsed.pathname.startsWith('/embed/')) {
      const parts = parsed.pathname.split('/');
      videoId = parts[2] || null;
    }
  }

  if (!videoId || videoId.trim().length === 0) {
    return { isValid: false, error: 'Could not extract a valid YouTube video ID from the provided URL' };
  }

  // Clean video ID check (alphanumeric, hyphens, underscores typically 11 chars)
  if (!/^[a-zA-Z0-9_-]{5,30}$/.test(videoId)) {
    return { isValid: false, error: 'Invalid YouTube video ID format' };
  }

  // Construct standardized safe canonical URL
  const sanitizedUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  return {
    isValid: true,
    sanitizedUrl,
    videoId
  };
}
