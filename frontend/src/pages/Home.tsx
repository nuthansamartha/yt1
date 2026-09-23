import React, { useState, useEffect, useRef } from 'react';
import { UrlInput } from '../components/UrlInput';
import { VideoInfo } from '../components/VideoInfo';
import { FormatSelector } from '../components/FormatSelector';
import { QualitySelector } from '../components/QualitySelector';
import { DownloadButton } from '../components/DownloadButton';
import { ProgressBar } from '../components/ProgressBar';
import { DownloadHistory } from '../components/DownloadHistory';
import { ErrorMessage } from '../components/ErrorMessage';
import { VideoInfo as VideoInfoType, DownloadJob, DownloadHistoryItem } from '../types';
import { getVideoInfo, startDownload, getDownloadStatus, cancelDownload, ApiError } from '../services/api';
import { Sparkles, Shield, Zap, Film } from 'lucide-react';

const STORAGE_KEY = 'yt_downloader_history_v1';

export const Home: React.FC = () => {
  const [analyzedUrl, setAnalyzedUrl] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfoType | null>(null);
  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [quality, setQuality] = useState<number | string>('best');
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isStartingDownload, setIsStartingDownload] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<DownloadJob | null>(null);

  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save download history:', e);
    }
  }, [history]);

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError(null);
    setVideoInfo(null);
    setActiveJob(null);

    try {
      const info = await getVideoInfo(url);
      setVideoInfo(info);
      setAnalyzedUrl(url);
      setFormat('mp4');
      setQuality('best');
    } catch (err: any) {
      console.error('[Home] Analyze error:', err);
      setError(err.message || 'Unable to download this video. Please verify that the URL is valid and that the video is publicly accessible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDownload = async () => {
    if (!analyzedUrl || !videoInfo) return;    setError(null);
    setIsStartingDownload(true);
    try {
      const { jobId } = await startDownload(analyzedUrl, format, quality);

      const initialJob: DownloadJob = {
        id: jobId,
        status: 'queued',
        progress: 0,
        originalTitle: videoInfo.title
      };
      setActiveJob(initialJob);

      // Start polling for progress
      startPolling(jobId);
    } catch (err: any) {
      console.error('[Home] Download launch error:', err);
      setError(err.message || 'Failed to start download job. Please try again.');
    } finally {
      setIsStartingDownload(false);
    }
  };

  const startPolling = (jobId: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    let consecutiveErrors = 0;

    pollingTimerRef.current = setInterval(async () => {
      try {
        const jobStatus = await getDownloadStatus(jobId);
        consecutiveErrors = 0;
        setActiveJob(jobStatus);

        if (jobStatus.status === 'completed') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

          // Add to session history
          if (videoInfo && jobStatus.downloadUrl) {
            const newItem: DownloadHistoryItem = {
              id: jobId,
              title: videoInfo.title,
              thumbnail: videoInfo.thumbnail,
              format,
              quality: quality === 'best' ? 'Best Available' : typeof quality === 'number' ? `${quality}p` : `${quality} kbps`,
              timestamp: Date.now(),
              downloadUrl: jobStatus.downloadUrl
            };
            setHistory((prev) => [newItem, ...prev.filter((h) => h.id !== jobId)].slice(0, 10));
          }
        } else if (jobStatus.status === 'failed') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setError(jobStatus.error || 'Download failed during stream processing.');
        }
      } catch (err: any) {
        console.error('[Home] Polling error:', err);
        consecutiveErrors += 1;
        const status = err instanceof ApiError ? err.status : undefined;
        // 404 = job expired/unknown; give up cleanly instead of hammering the API
        if (status === 404 || consecutiveErrors >= 8) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          setError(status === 404
            ? 'Download job not found on the server (it may have expired). Please start the download again.'
            : 'Lost connection to the server while tracking the download.');
          return;
        }
      }
    }, 1500);
  };

  const handleCancelDownload = async () => {
    if (!activeJob) return;
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    try {
      await cancelDownload(activeJob.id);
    } catch (e) {
      console.warn('[Home] Cancel request error:', e);
    } finally {
      setActiveJob(null);
      setError('Download job was cancelled.');
    }
  };

  const handleReset = () => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    setActiveJob(null);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero section */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full 4K Ultra HD & High-Bitrate Audio Support</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Download YouTube Media in <span className="gradient-text">Highest Quality</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Fast, safe, and secure video downloader leveraging native <code className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">yt-dlp</code> and <code className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">FFmpeg</code> engine.
        </p>
      </div>

      {/* Main Downloader Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Step 1: URL Input */}
        <UrlInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

        {/* Error notification */}
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Step 2: Video Metadata & Options */}
        {videoInfo && !activeJob && (
          <div className="space-y-6 pt-4 border-t border-gray-200/80 dark:border-gray-700/60 animate-fadeIn">
            <VideoInfo info={videoInfo} />

            <FormatSelector
              selectedFormat={format}
              onChangeFormat={(f) => {
                setFormat(f);
                setQuality('best');
              }}
            />

            <QualitySelector
              format={format}
              selectedQuality={quality}
              onChangeQuality={setQuality}
              availableResolutions={videoInfo.availableResolutions}
            />

            <DownloadButton
              onStartDownload={handleStartDownload}
              isDownloading={isStartingDownload}
              format={format}
              quality={quality}
            />
          </div>
        )}

        {/* Step 3: Download Progress Bar */}
        {activeJob && (
          <div className="pt-4 border-t border-gray-200/80 dark:border-gray-700/60">
            <ProgressBar job={activeJob} onReset={handleReset} onCancel={handleCancelDownload} />
          </div>
        )}
      </div>

      {/* Features highlight grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 shadow-sm space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center font-bold">
            <Film className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">Up to 4K / 2160p</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Merges 4K video & high quality audio tracks seamlessly</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 shadow-sm space-y-1">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">Real-Time Progress</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Live job tracking & status updates derived from yt-dlp</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 shadow-sm space-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 mx-auto flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">Secure & Safe</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Strict SSRF validation, sanitized filenames, no command injection</p>
        </div>
      </div>

      {/* Recent session download history */}
      <DownloadHistory
        history={history}
        onClearHistory={handleClearHistory}
        onRemoveItem={handleRemoveHistoryItem}
      />
    </div>
  );
};
