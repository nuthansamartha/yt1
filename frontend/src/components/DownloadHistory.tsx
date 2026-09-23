import React, { useState } from 'react';
import { DownloadHistoryItem } from '../types';
import { History, Download, Trash2, Video, Music, Copy, Check, X } from 'lucide-react';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onRemoveItem?: (id: string) => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  history,
  onClearHistory,
  onRemoveItem
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (history.length === 0) return null;

  const handleCopyLink = async (id: string, url: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-white dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-base text-gray-900 dark:text-white">
            Recent Session Downloads
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-semibold text-gray-600 dark:text-gray-400">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {history.map((item) => (
          <div
            key={item.id + item.timestamp}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {item.format === 'mp3' ? <Music className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {item.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="uppercase font-mono font-bold text-rose-500">
                    {item.format}
                  </span>
                  <span>•</span>
                  <span>{item.quality}</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
              <button
                type="button"
                onClick={() => handleCopyLink(item.id, item.downloadUrl)}
                title="Copy Direct Download Link"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <a
                href={item.downloadUrl}
                download
                className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                title="Save File"
              >
                <Download className="w-4 h-4" />
              </a>

              {onRemoveItem && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove from history"
                  className="p-2 text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
