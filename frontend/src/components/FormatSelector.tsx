import React from 'react';
import { Video, Music } from 'lucide-react';

interface FormatSelectorProps {
  selectedFormat: 'mp4' | 'mp3';
  onChangeFormat: (format: 'mp4' | 'mp3') => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onChangeFormat
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
        1. Select Format
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChangeFormat('mp4')}
          className={`flex items-center justify-center space-x-2.5 p-3.5 rounded-xl border font-semibold text-sm transition-all shadow-sm ${
            selectedFormat === 'mp4'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>MP4 Video</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeFormat('mp3')}
          className={`flex items-center justify-center space-x-2.5 p-3.5 rounded-xl border font-semibold text-sm transition-all shadow-sm ${
            selectedFormat === 'mp3'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>MP3 Audio</span>
        </button>
      </div>
    </div>
  );
};
