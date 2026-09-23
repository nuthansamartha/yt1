import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { FileService } from './fileService';

export interface YtdlpFormatInfo {
  formatId: string;
  resolution: string;
  height: number | null;
  fps: number | null;
  ext: string;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface YtdlpVideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  formats: YtdlpFormatInfo[];
  availableResolutions: number[]; // e.g. [2160, 1080, 720]
}

const METADATA_TIMEOUT_MS = 30_000;

export class YtdlpService {
  private static isYtdlpAvailable: boolean = false;
  private static isFfmpegAvailable: boolean = false;

  /**
   * Resolves yt-dlp executable and ffmpeg location (checking local bin/ first, then system PATH)
   */
  public static getExecutablePaths(): { ytdlpCmd: string; ffmpegLocation?: string } {
    const binDir = path.resolve(__dirname, '../../bin');
    const localYtdlpName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const localFfmpegName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

    const localYtdlp = path.join(binDir, localYtdlpName);
    const localFfmpeg = path.join(binDir, localFfmpegName);

    let ytdlpCmd = 'yt-dlp';
    if (fs.existsSync(localYtdlp)) {
      ytdlpCmd = localYtdlp;
    }

    let ffmpegLocation: string | undefined = undefined;
    if (fs.existsSync(localFfmpeg)) {
      ffmpegLocation = binDir;
    }

    return { ytdlpCmd, ffmpegLocation };
  }

  /**
   * Check for yt-dlp and ffmpeg binaries on backend start
   */
  public static checkDependencies(): { ytdlp: boolean; ffmpeg: boolean } {
    const { ytdlpCmd, ffmpegLocation } = this.getExecutablePaths();

    try {
      execSync(`"${ytdlpCmd}" --version`, { stdio: 'ignore' });
      this.isYtdlpAvailable = true;
    } catch {
      this.isYtdlpAvailable = false;
      console.warn(
        '⚠️ [YtdlpService] WARNING: `yt-dlp` binary is NOT found in backend/bin/ or system PATH.'
      );
    }

    try {
      const ffmpegBin = ffmpegLocation
        ? path.join(ffmpegLocation, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')
        : 'ffmpeg';
      execSync(`"${ffmpegBin}" -version`, { stdio: 'ignore' });
      this.isFfmpegAvailable = true;
    } catch {
      this.isFfmpegAvailable = false;
      console.warn(
        '⚠️ [YtdlpService] WARNING: `ffmpeg` binary is NOT found in backend/bin/ or system PATH.'
      );
    }

    const cookiesPath = this.getCookiesFilePath();
    if (cookiesPath) {
      console.log(`🍪 [Server] Found YouTube cookies file at: ${cookiesPath}`);
    } else {
      console.log(`ℹ️ [Server] No cookies.txt found. (Standard videos work directly; place cookies.txt in backend/ for bot/age-restricted videos)`);
    }

    return {
      ytdlp: this.isYtdlpAvailable,
      ffmpeg: this.isFfmpegAvailable
    };
  }

  /**
   * Age-gate bypass flags. Only used as a FALLBACK when the plain request
   * is rejected for age/sign-in/bot checks — forcing these clients on every
   * request breaks normal downloads (missing formats / "content not available").
   */
  private static buildAgeBypassArgs(): string[] {
    return [
      '--extractor-args', 'youtube:player_client=web_creator,tv_embedded,web',
    ];
  }

  /**
   * Resolve path to a cookies.txt file if present in the backend root, bin, or via env.
   */
  public static getCookiesFilePath(): string | null {
    // Priority order: env var first, then prefer the more complete
    // www.youtube.com_cookies.txt (has SAPISID + full auth) over the bare cookies.txt.
    const candidatePaths = [
      process.env.YOUTUBE_COOKIES_PATH,
      path.resolve(__dirname, '../../www.youtube.com_cookies.txt'),
      path.resolve(__dirname, '../../youtube.com_cookies.txt'),
      path.resolve(__dirname, '../../bin/www.youtube.com_cookies.txt'),
      path.resolve(__dirname, '../../cookies.txt'),
      path.resolve(__dirname, '../../bin/cookies.txt'),
      path.resolve(process.cwd(), 'www.youtube.com_cookies.txt'),
      path.resolve(process.cwd(), 'cookies.txt'),
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        // Prefer files that contain SAPISID (full auth cookies) over minimal ones
        try {
          const content = fs.readFileSync(p, 'utf8');
          if (content.includes('SAPISID') || content.includes('LOGIN_INFO')) {
            return p;
          }
        } catch { /* ignore, fall through to size check */ }
      }
    }

    // Fallback: return the first existing file even if it lacks SAPISID
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // Dynamic scan in backend directory for any file ending with cookies.txt
    try {
      const backendDir = path.resolve(__dirname, '../../');
      const files = fs.readdirSync(backendDir);
      // Prefer www.youtube.com_cookies.txt variants first
      const wwwMatch = files.find(f => f.toLowerCase().startsWith('www.') && f.toLowerCase().includes('cookie'));
      if (wwwMatch) return path.join(backendDir, wwwMatch);
      const match = files.find(f => f.toLowerCase().endsWith('.txt') && f.toLowerCase().includes('cookie'));
      if (match) return path.join(backendDir, match);
    } catch {
      /* ignore */
    }

    return null;
  }

  private static isAgeOrAuthError(message: string): boolean {
    return /sign in|confirm (you|your age)|age.restrict|inappropriate|log ?in|nsig|not a bot/i.test(message);
  }

  private static isUnavailableError(message: string): boolean {
    return /video unavailable|private video|removed by the uploader|does not exist/i.test(message);
  }

  /**
   * Kill a child process and all of its descendants (ffmpeg keeps running on
   * Windows if we only signal yt-dlp itself).
   */
  private static killProcessTree(child: ReturnType<typeof spawn> | null): void {
    if (!child || child.pid === undefined) return;
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { shell: false, stdio: 'ignore' });
      } else {
        child.kill('SIGKILL');
      }
    } catch {
      /* already terminated */
    }
  }

  /**
   * Check if browser cookie database is accessible (not locked by a running browser).
   * Chromium-based browsers lock their SQLite cookie DB while open.
   * Returns the browser name if cookies are accessible, null otherwise.
   */
  private static detectAvailableBrowser(): string | null {
    const browsers = [
      { name: 'chrome',   cookieDb: `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data\\Default\\Cookies`,           profileDir: `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data` },
      { name: 'edge',     cookieDb: `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data\\Default\\Cookies`,           profileDir: `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\User Data` },
      { name: 'firefox',  cookieDb: '',                                                                                      profileDir: `${process.env.APPDATA}\\Mozilla\\Firefox\\Profiles` },
      { name: 'brave',    cookieDb: `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Cookies`, profileDir: `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\User Data` },
      { name: 'chromium', cookieDb: `${process.env.LOCALAPPDATA}\\Chromium\\User Data\\Default\\Cookies`,                  profileDir: `${process.env.LOCALAPPDATA}\\Chromium\\User Data` },
      { name: 'vivaldi',  cookieDb: `${process.env.LOCALAPPDATA}\\Vivaldi\\User Data\\Default\\Cookies`,                   profileDir: `${process.env.LOCALAPPDATA}\\Vivaldi\\User Data` },
    ];

    for (const browser of browsers) {
      try {
        if (!browser.profileDir || !fs.existsSync(browser.profileDir)) continue;

        // For Chromium-based browsers, verify we can read (not just that the dir exists)
        // by attempting to open the cookie file non-exclusively. If it throws EBUSY/EPERM,
        // the browser is running and has the DB locked.
        if (browser.cookieDb && fs.existsSync(browser.cookieDb)) {
          try {
            const fd = fs.openSync(browser.cookieDb, 'r');
            fs.closeSync(fd);
            // File is readable — cookies accessible
            return browser.name;
          } catch {
            // EBUSY or EPERM = browser has it locked, skip
            continue;
          }
        }

        // Firefox uses a different DB format that yt-dlp can handle even while open
        if (browser.name === 'firefox') {
          return 'firefox';
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  /**
   * Parse raw yt-dlp JSON info into YtdlpVideoMetadata
   */
  private static parseVideoInfo(rawInfo: any): YtdlpVideoMetadata {
    const rawFormats = Array.isArray(rawInfo.formats) ? rawInfo.formats : [];

    const processedFormats: YtdlpFormatInfo[] = [];
    const heightSet = new Set<number>();

    for (const f of rawFormats) {
      const height = typeof f.height === 'number' ? f.height : null;
      const hasVideo = f.vcodec !== 'none' && !!f.vcodec;
      const hasAudio = f.acodec !== 'none' && !!f.acodec;
      const fps = typeof f.fps === 'number' ? f.fps : null;
      const ext = f.ext || 'mp4';
      const resolution = height ? `${height}p` : 'Audio Only';

      if (height && hasVideo) {
        heightSet.add(height);
      }

      processedFormats.push({
        formatId: String(f.format_id || ''),
        resolution,
        height,
        fps,
        ext,
        hasVideo,
        hasAudio
      });
    }

    const availableResolutions = Array.from(heightSet).sort((a, b) => b - a);

    return {
      id: String(rawInfo.id || 'video'),
      title: String(rawInfo.title || 'Untitled Video'),
      thumbnail: String(rawInfo.thumbnail || (rawInfo.thumbnails && rawInfo.thumbnails[rawInfo.thumbnails.length - 1]?.url) || ''),
      duration: Number(rawInfo.duration || 0),
      uploader: String(rawInfo.uploader || rawInfo.channel || 'Unknown Uploader'),
      formats: processedFormats,
      availableResolutions
    };
  }

  /**
   * Run yt-dlp with given args and return parsed JSON metadata.
   * Times out after METADATA_TIMEOUT_MS so requests never hang forever.
   * Returns { data, stderr, code }.
   */
  private static runYtdlpJson(
    ytdlpCmd: string,
    args: string[]
  ): Promise<{ data: string; stderr: string; code: number | null }> {
    return new Promise((resolve) => {
      const child = spawn(ytdlpCmd, args, { shell: false });
      let stdoutData = '';
      let stderrData = '';
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.killProcessTree(child);
        resolve({ data: stdoutData, stderr: `${stderrData}\nERROR: metadata fetch timed out`, code: -1 });
      }, METADATA_TIMEOUT_MS);

      child.stdout.on('data', (d) => { stdoutData += d.toString(); });
      child.stderr.on('data', (d) => { stderrData += d.toString(); });

      child.on('error', (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve({ data: '', stderr: err.message, code: -1 });
      });

      child.on('close', (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve({ data: stdoutData, stderr: stderrData, code });
      });
    });
  }

  /**
   * Fetch video metadata securely via yt-dlp --dump-single-json.
   * Automatically retries with age-bypass flags and browser cookies if the
   * first attempt fails due to age restrictions or sign-in requirements.
   */
  public static async getVideoInfo(url: string): Promise<YtdlpVideoMetadata> {
    const { ytdlpCmd, ffmpegLocation } = this.getExecutablePaths();

    const baseArgs = [
      '--dump-single-json',
      '--no-playlist',
      '--no-warnings',
      '--skip-download',
    ];

    if (ffmpegLocation) {
      baseArgs.push('--ffmpeg-location', ffmpegLocation);
    }

    const cookiesFile = this.getCookiesFilePath();
    if (cookiesFile) {
      console.log(`[YtdlpService] Using cookies from file: ${cookiesFile}`);
      baseArgs.push('--cookies', cookiesFile);
    }

    // --- Attempt 1: Standard request ---
    const result1 = await this.runYtdlpJson(ytdlpCmd, [...baseArgs, url]);

    if (result1.code === 0 && result1.data) {
      try {
        return this.parseVideoInfo(JSON.parse(result1.data));
      } catch (err: any) {
        throw new Error(`Failed to parse video metadata: ${err.message}`);
      }
    }

    if (this.isUnavailableError(result1.stderr)) {
      throw new Error('This video is private, unavailable, or deleted.');
    }

    // --- Attempt 2: Age bypass with TV embedded client ---
    const bypassArgs = [...baseArgs, ...this.buildAgeBypassArgs(), url];
    console.log(`[YtdlpService] Metadata attempt 2 (age bypass) for: ${url}`);
    const result2 = await this.runYtdlpJson(ytdlpCmd, bypassArgs);

    if (result2.code === 0 && result2.data) {
      try {
        console.log(`[YtdlpService] Age bypass succeeded for: ${url}`);
        return this.parseVideoInfo(JSON.parse(result2.data));
      } catch (err: any) {
        throw new Error(`Failed to parse video metadata: ${err.message}`);
      }
    }

    // --- Attempt 3: Age bypass + browser cookies ---
    const detectedBrowser = this.detectAvailableBrowser();
    if (detectedBrowser && !cookiesFile) {
      const cookieArgs = [
        ...baseArgs,
        ...this.buildAgeBypassArgs(),
        '--cookies-from-browser', detectedBrowser,
        url
      ];
      console.log(`[YtdlpService] Metadata attempt 3 (${detectedBrowser} cookies) for: ${url}`);
      const result3 = await this.runYtdlpJson(ytdlpCmd, cookieArgs);

      if (result3.code === 0 && result3.data) {
        try {
          console.log(`[YtdlpService] Cookie bypass succeeded via ${detectedBrowser} for: ${url}`);
          return this.parseVideoInfo(JSON.parse(result3.data));
        } catch (err: any) {
          throw new Error(`Failed to parse video metadata: ${err.message}`);
        }
      }

      console.error(`[YtdlpService] All metadata attempts failed. Last stderr:`, result3.stderr);

      if (this.isUnavailableError(result3.stderr)) {
        throw new Error('This video is private, unavailable, or deleted.');
      }
      if (this.isAgeOrAuthError(result3.stderr)) {
        throw new Error('This video requires YouTube sign-in / bot verification. Place a cookies.txt file in the backend folder to download restricted videos.');
      }
      throw new Error('Failed to retrieve video information. The video may be restricted, region-locked, or deleted.');
    }

    // No browser found or already attempted cookiesFile
    console.error(`[YtdlpService] Age bypass failed. Stderr:`, result2.stderr);
    if (this.isUnavailableError(result2.stderr)) {
      throw new Error('This video is private, unavailable, or deleted.');
    }
    if (this.isAgeOrAuthError(result2.stderr)) {
      throw new Error('This video requires YouTube sign-in or bot verification. Export a cookies.txt file from YouTube and place it inside the backend folder.');
    }
    throw new Error('Failed to retrieve video information. Please ensure the URL is valid and accessible.');
  }

  /**
   * Download media as a child process and monitor progress.
   * Fallback ladder: plain -> age-bypass -> browser cookies -> (cookie-locked retry without cookies).
   */
  public static startDownloadProcess(
    jobId: string,
    url: string,
    format: 'mp4' | 'mp3',
    quality: number | string, // height like 2160, 1080 or bitrate string '320'
    onProgress: (progress: number, statusMessage: string, speed?: string, eta?: string) => void,
    onComplete: (filename: string, filepath: string) => void,
    onError: (error: string) => void
  ): { kill: () => void } {
    const { ytdlpCmd, ffmpegLocation } = this.getExecutablePaths();
    const downloadDir = FileService.getDownloadDir();
    const outputTemplate = path.join(downloadDir, `${jobId}.%(ext)s`);

    let killed = false;
    let activeChild: ReturnType<typeof spawn> | null = null;
    let lastProgress = 0;
    let sizeCheckInterval: NodeJS.Timeout | null = null;

    const killHandle = {
      kill: () => {
        killed = true;
        if (sizeCheckInterval) clearInterval(sizeCheckInterval);
        this.killProcessTree(activeChild);
      }
    };

    const buildDownloadArgs = (mode: 'plain' | 'bypass' | 'cookies', browserName?: string): string[] => {
      const args: string[] = [
        '--no-playlist',
        '--no-warnings',
        '--newline',
        // Concurrent fragment downloads make DASH streams finish much faster
        '-N', '4',
        '--user-agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        '-o', outputTemplate,
      ];
        


      if (mode !== 'plain') {
        args.push(...this.buildAgeBypassArgs());
      }
      const cookiesFile = this.getCookiesFilePath();
      if (cookiesFile) {
        args.push('--cookies', cookiesFile);
      } else if (mode === 'cookies' && browserName) {
        args.push('--cookies-from-browser', browserName);
      }
      if (ffmpegLocation) {
        args.push('--ffmpeg-location', ffmpegLocation);
      }

      if (format === 'mp3') {
        if (!this.isFfmpegAvailable) {
          throw new Error('FFmpeg is not installed on the server — MP3 extraction is unavailable. Run backend/bin/download_deps.ps1 or install FFmpeg on the system PATH.');
        }
        args.push('-x', '--audio-format', 'mp3');
        if (typeof quality === 'number' || (typeof quality === 'string' && !isNaN(Number(quality)))) {
          args.push('--audio-quality', `${Number(quality)}k`);
        } else {
          args.push('--audio-quality', '0');
        }
      } else if (!this.isFfmpegAvailable) {
        // Without ffmpeg we cannot merge separate video+audio DASH streams;
        // fall back to a single progressive stream (capped at 720p by YouTube).
        const heightNum = typeof quality === 'number' ? quality : Number(quality);
        const capFilter = !isNaN(heightNum) && heightNum > 0 ? `[height<=${heightNum}]` : '';
        args.push('-f', `best${capFilter}[ext=mp4]/best${capFilter}/best`);
      } else {
        if (quality === 'best' || !quality) {
          args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best');
        } else {
          const heightNum = Number(quality);
          args.push('-f', `bestvideo[height<=${heightNum}]+bestaudio/best[height<=${heightNum}]/best`);
        }
        args.push('--merge-output-format', 'mp4');
      }

      args.push(url);
      return args;
    };

    const cleanPartialFiles = (): void => {
      try {
        fs.readdirSync(downloadDir)
          .filter((f) => f.startsWith(jobId))
          .forEach((f) => fs.unlinkSync(path.join(downloadDir, f)));
      } catch { /* ignore */ }
    };

    const fail = (message: string): void => {
      if (sizeCheckInterval) clearInterval(sizeCheckInterval);
      console.error(`[YtdlpService] Download failed for job ${jobId}: ${message}`);
      onError(message);
    };

    const spawnDownload = (mode: 'plain' | 'bypass' | 'cookies', browserName?: string): void => {
      if (killed) return;

      const args = buildDownloadArgs(mode, browserName);
      console.log(`[YtdlpService] Spawning download for job ${jobId} (mode: ${mode}${browserName ? `, cookies: ${browserName}` : ''})`);

      const child = spawn(ytdlpCmd, args, { shell: false });
      activeChild = child;
      let stderrMsg = '';

      // Start size-check interval (only once for the first spawn)
      if (!sizeCheckInterval) {
        sizeCheckInterval = setInterval(() => {
          try {
            const files = fs.readdirSync(downloadDir);
            for (const file of files) {
              if (file.startsWith(jobId)) {
                const fullPath = path.join(downloadDir, file);
                if (FileService.checkFileSizeExceeded(fullPath)) {
                  console.warn(`[YtdlpService] File size exceeded for job ${jobId}. Killing.`);
                  killHandle.kill();
                  onError('The selected download exceeds the server\'s maximum allowed file size limit.');
                  return;
                }
              }
            }
          } catch { /* ignore read errors during download */ }
        }, 3000);
      }

      child.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        for (const line of text.split(/\r?\n/)) {
          if (!line.trim()) continue;
          const match = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
          if (match) {
            const percent = parseFloat(match[1]);
            if (!isNaN(percent)) {
              // Map download to 0-90 so merge/convert steps have room.
              // Monotonic: never move backwards when the audio stream pass restarts at 0%.
              const mapped = Math.min(90, Math.floor(percent * 0.9));
              if (mapped > lastProgress) lastProgress = mapped;
              const speedMatch = line.match(/at\s+([0-9.]+\s*[a-zA-Z]+\/s)/i);
              const etaMatch = line.match(/ETA\s+([0-9:]+)/i);
              onProgress(lastProgress, 'downloading', speedMatch?.[1], etaMatch?.[1]);
            }
          } else if (line.includes('[Merger]') || line.includes('[ExtractAudio]') || line.includes('ffmpeg')) {
            onProgress(Math.max(lastProgress, 95), 'processing');
          }
        }
      });

      child.stderr.on('data', (data: Buffer) => {
        stderrMsg += data.toString();
      });

      child.on('error', (err) => {
        if (sizeCheckInterval) clearInterval(sizeCheckInterval);
        onError(`Failed to launch yt-dlp: ${err.message}`);
      });

      child.on('close', (code) => {
        if (killed) return;

        if (code !== 0) {
          const isAgeOrSignIn = this.isAgeOrAuthError(stderrMsg);
          const isCookieLock =
            stderrMsg.includes('Could not copy') ||
            stderrMsg.includes('cookie database') ||
            stderrMsg.includes('PermissionError') ||
            stderrMsg.includes('database is locked') ||
            stderrMsg.includes('could not find cookies');

          // If the failure was caused by a locked cookie DB, retry WITHOUT cookies
          if (mode === 'cookies' && isCookieLock) {
            console.warn(`[YtdlpService] Cookie DB locked for job ${jobId}. Retrying without cookies...`);
            cleanPartialFiles();
            spawnDownload('bypass');
            return;
          }

          // Plain attempt blocked by age gate / bot check -> retry with bypass flags
          if (mode === 'plain' && isAgeOrSignIn) {
            console.warn(`[YtdlpService] Plain download rejected for job ${jobId}. Retrying with age-bypass client...`);
            cleanPartialFiles();
            spawnDownload('bypass');
            return;
          }

          // Bypass attempt still blocked -> last resort: browser cookies
          if (mode === 'bypass' && isAgeOrSignIn) {
            const detectedBrowser = this.detectAvailableBrowser();
            if (detectedBrowser) {
              console.warn(`[YtdlpService] Age-bypass failed for job ${jobId}. Retrying with ${detectedBrowser} cookies...`);
              cleanPartialFiles();
              spawnDownload('cookies', detectedBrowser);
              return;
            }
          }

          if (stderrMsg.includes('File size exceeds')) {
            return fail('The selected video exceeds maximum size limits.');
          }
          if (isCookieLock) {
            return fail('Could not access browser cookies (they are locked by a running browser). Please close your browser and retry, or try a non-restricted video.');
          }
          // Surface the actual yt-dlp error so users/devs can debug
          const errorLine = stderrMsg.split('\n').find((l) => l.startsWith('ERROR:')) || '';
          const detail = errorLine ? ` (${errorLine.replace('ERROR:', '').trim()})` : '';
          return fail(`Download failed${detail}. Please try again or choose a different quality.`);
        }

        // Success — find the output file (ignore partial/temp leftovers)
        if (sizeCheckInterval) clearInterval(sizeCheckInterval);
        try {
          const candidates = fs
            .readdirSync(downloadDir)
            .filter(
              (f) =>
                f.startsWith(jobId) &&
                !f.endsWith('.part') &&
                !f.endsWith('.ytdl') &&
                !f.endsWith('.tmp')
            )
            .map((f) => ({ file: f, mtime: fs.statSync(path.join(downloadDir, f)).mtimeMs }))
            .sort((a, b) => b.mtime - a.mtime);

          if (candidates.length === 0) {
            return onError('Downloaded file not found on server storage.');
          }
          const targetFile = candidates[0].file;
          onProgress(100, 'completed');
          onComplete(targetFile, path.join(downloadDir, targetFile));
        } catch (err: any) {
          onError(`File processing error: ${err.message}`);
        }
      });
    };

    // Kick off download with the plain (no forced client override) arg set.
    // buildDownloadArgs may throw synchronously (e.g. mp3 without ffmpeg).
    try {
      spawnDownload('plain');
    } catch (err: any) {
      onError(err.message || 'Failed to build download arguments.');
    }

    return killHandle;
  }
}
