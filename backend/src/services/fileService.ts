import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DOWNLOAD_DIR = path.resolve(process.env.DOWNLOAD_DIR || './downloads');
const MAX_DOWNLOAD_SIZE_BYTES = (parseFloat(process.env.MAX_DOWNLOAD_SIZE_GB || '10') || 10) * 1024 * 1024 * 1024;

export class FileService {
  public static ensureDownloadDir(): string {
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }
    return DOWNLOAD_DIR;
  }

  public static getDownloadDir(): string {
    return this.ensureDownloadDir();
  }

  public static getFilePath(filename: string): string {
    const safeDir = this.ensureDownloadDir();
    const resolvedPath = path.resolve(safeDir, filename);
    
    // Prevent path traversal outside DOWNLOAD_DIR
    if (!resolvedPath.startsWith(safeDir)) {
      throw new Error('Access denied: Invalid file path');
    }
    return resolvedPath;
  }

  public static checkFileSizeExceeded(filepath: string): boolean {
    try {
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        return stats.size > MAX_DOWNLOAD_SIZE_BYTES;
      }
    } catch {
      // Ignore stat error if file doesn't exist yet
    }
    return false;
  }

  public static deleteFile(filepath: string): void {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`[FileService] Deleted file: ${filepath}`);
      }
    } catch (err) {
      console.error(`[FileService] Failed to delete file: ${filepath}`, err);
    }
  }

  public static cleanupOldFiles(maxAgeMinutes: number = 30): void {
    try {
      const dir = this.ensureDownloadDir();
      const files = fs.readdirSync(dir);
      const now = Date.now();
      const maxAgeMs = maxAgeMinutes * 60 * 1000;

      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          this.deleteFile(fullPath);
        }
      }
    } catch (err) {
      console.error('[FileService] Error cleaning up old files:', err);
    }
  }
}
