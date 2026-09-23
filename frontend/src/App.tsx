import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { HowItWorksModal } from './components/HowItWorksModal';

export const App: React.FC = () => {
  // Default dark mode based on localStorage or system preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('yt_downloader_theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('yt_downloader_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('yt_downloader_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Home />
      </main>

      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p>© {new Date().getFullYear()} Video Downloader • Powered by Node.js, yt-dlp & FFmpeg</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Intended for downloading content you own or are legally authorized to download.
          </p>
        </div>
      </footer>

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};

export default App;
