import React from 'react';
import { DownloadJob } from '../types';
import { Loader2, Download, CheckCircle, AlertTriangle, Zap, Clock, XCircle } from 'lucide-react';

interface ProgressBarProps {
  job: DownloadJob;
  onReset: () => void;
  onCancel?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ job, onReset, onCancel }) => {
  const getStatusLabel = (): string => {
    switch (job.status) {
      case 'queued':
        return 'Job queued...';
      case 'fetching':
        return 'Preparing stream & metadata...';
      case 'downloading':
        return `Downloading media streams (${job.progress}%)`;
      case 'processing':
        return 'Merging audio & video formats (FFmpeg)...';
      case 'completed':
        return 'Download Ready!';
      case 'failed':
        return 'Download Failed';
      default:
        return 'Processing...';
    }
  };

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isActive = !isCompleted && !isFailed;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          {isActive && (
            <Loader2 className="w-5 h-5 text-rose-500 animate-spin flex-shrink-0" />
          )}
          {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
          {isFailed && <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
            {getStatusLabel()}
          </span>
        </div>

        <span className="text-sm font-bold text-rose-600 dark:text-rose-400 flex-shrink-0 ml-2">
          {job.progress}%
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-gray-600/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCompleted
              ? 'bg-emerald-500'
              : isFailed
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500'
          }`}
          style={{ width: `${Math.max(5, Math.min(100, job.progress))}%` }}
        />
      </div>

      {/* Speed & ETA indicators if downloading */}
      {isActive && (job.speed || job.eta) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
          {job.speed && (
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/60 px-2.5 py-1 rounded-md">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Speed: <strong className="text-gray-700 dark:text-gray-200">{job.speed}</strong></span>
            </div>
          )}
          {job.eta && (
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700/60 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>ETA: <strong className="text-gray-700 dark:text-gray-200">{job.eta}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isActive && onCancel && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-1.5 py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs transition-colors border border-rose-200 dark:border-rose-800"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Download</span>
          </button>
        </div>
      )}

      {isCompleted && job.downloadUrl && (
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <a
            href={job.downloadUrl}
            download
            className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Save Downloaded File</span>
          </a>

          <button
            type="button"
            onClick={onReset}
            className="py-3 px-5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition-colors"
          >
            Download Another Video
          </button>
        </div>
      )}

      {isFailed && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
