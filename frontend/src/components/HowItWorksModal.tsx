import React from 'react';
import { X, Search, Settings2, DownloadCloud, ShieldCheck, Film } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              How Video Downloader Works
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              High performance YouTube media extraction architecture
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-rose-500" />
                Paste & Analyze Link
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Enter any valid YouTube video, shorts, or share link. Our secure backend queries <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">yt-dlp</code> for live metadata and available resolutions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-rose-500" />
                Select Format & Quality
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Choose MP4 video (up to 4K / 2160p) or MP3 audio. Only qualities present in the source video are offered to prevent fake upscaling.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <DownloadCloud className="w-3.5 h-3.5 text-rose-500" />
                Stream Merging & Download
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                4K & HD videos separate video and audio streams. The backend uses <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">FFmpeg</code> to combine them into high quality MP4 files and delivers them directly to your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <span className="font-bold block mb-0.5">Authorized Use Policy</span>
            This tool is designed for downloading videos that you own or are legally authorized to download. It does not bypass DRM, paywalls, or private permissions.
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
