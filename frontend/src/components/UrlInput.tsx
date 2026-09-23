import React, { useState } from 'react';
import { Search, Loader2, Link2, AlertCircle, Clipboard, X } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateClientUrl = (input: string): boolean => {
    if (!input.trim()) {
      setValidationError('Please paste a YouTube video URL.');
      return false;
    }

    try {
      const parsed = new URL(input.trim());
      const hostname = parsed.hostname.toLowerCase();
      const validDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'];

      if (!validDomains.includes(hostname)) {
        setValidationError('Please enter a valid YouTube domain (e.g. youtube.com or youtu.be).');
        return false;
      }

      setValidationError(null);
      return true;
    } catch {
      setValidationError('Invalid URL format. Please check the pasted link.');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateClientUrl(url)) {
      onAnalyze(url.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (validationError) setValidationError(null);
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          if (validationError) setValidationError(null);
        }
      }
    } catch (e) {
      console.warn('Clipboard access denied or unsupported:', e);
    }
  };

  const handleClear = () => {
    setUrl('');
    setValidationError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 transition-all focus-within:ring-2 focus-within:ring-rose-500/50">
          <div className="pl-4 text-gray-400">
            <Link2 className="w-5 h-5" />
          </div>

          <input
            type="url"
            value={url}
            onChange={handleInputChange}
            placeholder="Paste YouTube URL here... (e.g. https://www.youtube.com/watch?v=...)"
            disabled={isLoading}
            className="w-full py-4 pl-3 pr-44 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-transparent focus:outline-none disabled:opacity-60"
            aria-label="YouTube URL Input"
          />

          <div className="absolute right-2 top-2 bottom-2 flex items-center space-x-1.5">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                title="Clear input"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                title="Paste from clipboard"
                className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-1"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="h-full px-5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>

        {validationError && (
          <div className="mt-2.5 flex items-center space-x-1.5 text-sm text-rose-600 dark:text-rose-400 px-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span>Supports:</span>
        <span className="font-mono bg-gray-200/60 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">youtube.com/watch?v=...</span>
        <span className="font-mono bg-gray-200/60 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">youtu.be/...</span>
        <span className="font-mono bg-gray-200/60 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">youtube.com/shorts/...</span>
      </div>
    </div>
  );
};
