import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <div
      role="alert"
      className="w-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-4 flex items-start justify-between shadow-sm animate-fadeIn"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-rose-800 dark:text-rose-200 font-medium leading-relaxed">
          <p className="font-bold text-rose-900 dark:text-rose-100 mb-0.5">Unable to process request</p>
          <p>{message}</p>
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-1 rounded-lg transition-colors"
          aria-label="Dismiss error message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
