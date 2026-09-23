/**
 * Utility to sanitize user- or metadata-derived filenames for safe disk storage.
 * Prevents path traversal and illegal character issues across Windows and Unix platforms.
 */
import path from 'path';

export function sanitizeFilename(filename: string, defaultExt: string = 'mp4'): string {
  if (!filename || typeof filename !== 'string') {
    return `media_${Date.now()}.${defaultExt}`;
  }

  // Extract base and extension if already present
  const ext = path.extname(filename).replace(/^\./, '') || defaultExt;
  const nameWithoutExt = path.basename(filename, path.extname(filename));

  // Remove path traversal and dangerous characters: / \ : * ? " < > | \0
  let sanitized = nameWithoutExt
    .replace(/[/\b\f\n\r\t\v\0\\:*?"<>|]/g, '_')
    .replace(/\.\.+/g, '_') // Remove ..
    .replace(/^\.+/, '')   // Remove leading dots
    .trim();

  // Collapse multiple spaces/underscores
  sanitized = sanitized.replace(/[\s_]+/g, '_');

  // Truncate to reasonable max length (e.g. 100 characters)
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  if (!sanitized) {
    sanitized = `download_${Date.now()}`;
  }

  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || defaultExt;
  return `${sanitized}.${cleanExt}`;
}
