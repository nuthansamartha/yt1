import React from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
  onStartDownload: () => void;
  isDownloading: boolean;
  format: 'mp4' | 'mp3';
  quality: number | string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onStartDownload,
  isDownloading,
  format,
  quality
}) => {
  const qualityDisplay = quality === 'best' ? 'Best Available' : typeof quality === 'number' ? `${quality}p` : `${quality} kbps`;

  return (
    <div className="w-full pt-2">
      <button
        type="button"
        disabled={isDownloading}
        onClick={onStartDownload}
        className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:via-rose-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-200 flex items-center justify-center space-x-3 transform active:scale-[0.99] disabled:cursor-not-allowed disabled:transform-none"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span>Initializing Download Process...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download {format.toUpperCase()} ({qualityDisplay})</span>
          </>
        )}
      </button>
    </div>
  );
};
