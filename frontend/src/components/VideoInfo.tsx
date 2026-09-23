import React from 'react';
import { VideoInfo as VideoInfoType } from '../types';
import { Clock, User, Film, CheckCircle2 } from 'lucide-react';

interface VideoInfoProps {
  info: VideoInfoType;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ info }) => {
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return 'Unknown';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxResolution = info.availableResolutions[0] || 0;
  const is4KAvailable = maxResolution >= 2160;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail preview */}
        <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 group shadow-md">
          {info.thumbnail ? (
            <img
              src={info.thumbnail}
              alt={info.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <Film className="w-10 h-10" />
            </div>
          )}

          {is4KAvailable && (
            <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-md shadow-lg tracking-wide uppercase">
              4K 2160p
            </span>
          )}

          {info.duration > 0 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium bg-black/80 text-white rounded backdrop-blur-sm">
              {formatDuration(info.duration)}
            </span>
          )}
        </div>

        {/* Video metadata */}
        <div className="flex-1 min-w-0 space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {info.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1.5 font-medium">
              <User className="w-4 h-4 text-rose-500" />
              <span className="truncate max-w-[200px]">{info.uploader}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Duration: {formatDuration(info.duration)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Available Resolutions:
            </span>
            {info.availableResolutions.length > 0 ? (
              info.availableResolutions.map((res) => (
                <span
                  key={res}
                  className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    res >= 2160
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/60'
                      : res >= 1080
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{res >= 2160 ? `${res}p (4K)` : res >= 1440 ? `${res}p (2K)` : `${res}p`}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">Standard formats detected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
