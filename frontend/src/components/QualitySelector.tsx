import React from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface QualityOption {
  label: string;
  value: number | string;
  is4K?: boolean;
}

interface QualitySelectorProps {
  format: 'mp4' | 'mp3';
  selectedQuality: number | string;
  onChangeQuality: (quality: number | string) => void;
  availableResolutions: number[]; // e.g. [2160, 1080, 720]
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  format,
  selectedQuality,
  onChangeQuality,
  availableResolutions
}) => {
  const maxAvailableRes = availableResolutions[0] || 1080;

  const videoOptions: QualityOption[] = [
    { label: 'Best Available', value: 'best' },
    { label: '2160p (4K)', value: 2160, is4K: true },
    { label: '1440p (2K)', value: 1440 },
    { label: '1080p (Full HD)', value: 1080 },
    { label: '720p (HD)', value: 720 },
    { label: '480p', value: 480 },
    { label: '360p', value: 360 }
  ];

  const audioOptions: QualityOption[] = [
    { label: 'Best Available', value: 'best' },
    { label: '320 kbps', value: '320' },
    { label: '256 kbps', value: '256' },
    { label: '192 kbps', value: '192' },
    { label: '128 kbps', value: '128' }
  ];

  const options = format === 'mp4' ? videoOptions : audioOptions;

  const isResAvailable = (val: number | string): boolean => {
    if (format === 'mp3') return true;
    if (val === 'best') return true;
    const reqHeight = typeof val === 'number' ? val : parseInt(val, 10);
    // Return true if requested resolution is <= highest available resolution in video
    return reqHeight <= maxAvailableRes;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          2. Select Quality / Resolution
        </label>
        {format === 'mp4' && maxAvailableRes >= 2160 && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-3 h-3" />
            4K Ultra HD Source Available
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {options.map((opt) => {
          const available = isResAvailable(opt.value);
          const isSelected = selectedQuality === opt.value;

          return (
            <button
              key={String(opt.value)}
              type="button"
              disabled={!available}
              onClick={() => available && onChangeQuality(opt.value)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all shadow-sm ${
                !available
                  ? 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                  : isSelected
                  ? opt.is4K
                    ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span>{opt.label}</span>
              {opt.is4K && available && (
                <span className="mt-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Ultra HD
                </span>
              )}
              {!available && (
                <span className="mt-0.5 text-[10px] text-gray-400">Not Available</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
