import React, { useState } from 'react';
import { AppView } from './types';
import TabButton from './components/TabButton';
import WatchTonight from './components/WatchTonight';
import IsItOnStreaming from './components/IsItOnStreaming';
import Watchlist from './components/Watchlist';
import Friends from './components/Friends';
import { WatchlistProvider } from './context/WatchlistContext';

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 64 42"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M32 0C15.8 0 2.7 15.6.3 20.2a1.4 1.4 0 0 0 0 1.6C2.7 26.4 15.8 42 32 42s29.3-15.6 31.7-20.2a1.4 1.4 0 0 0 0-1.6C61.3 15.6 48.2 0 32 0ZM32 33c-6.4 0-11.7-5.2-11.7-11.7S25.6 9.6 32 9.6s11.7 5.2 11.7 11.7S38.4 33 32 33ZM28 15v12l10-6-10-6Z"
    />
  </svg>
);

const FilmIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;


const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WATCH_TONIGHT);

  const renderView = () => {
    switch (currentView) {
      case AppView.WATCH_TONIGHT:
        return <WatchTonight />;
      case AppView.IS_IT_ON_STREAMING:
        return <IsItOnStreaming />;
       case AppView.WATCHLIST:
        return <Watchlist />;
       case AppView.FRIENDS:
        return <Friends />;
      default:
        return <WatchTonight />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="py-6 text-center">
        <div className="inline-flex flex-col items-center gap-3">
            <LogoIcon className="w-20 h-auto text-indigo-400" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                StreamSeen
              </h1>
              <p className="text-gray-400 mt-2">Your all-in-one streaming assistant</p>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
            <div className="flex flex-wrap justify-center space-x-2 md:space-x-4 bg-gray-800 p-2 rounded-xl border border-gray-700">
                <TabButton 
                    label="Watch Tonight"
                    icon={<FilmIcon />}
                    isActive={currentView === AppView.WATCH_TONIGHT}
                    onClick={() => setCurrentView(AppView.WATCH_TONIGHT)}
                />
                <TabButton 
                    label="Find Streaming"
                    icon={<SearchIcon />}
                    isActive={currentView === AppView.IS_IT_ON_STREAMING}
                    onClick={() => setCurrentView(AppView.IS_IT_ON_STREAMING)}
                />
                 <TabButton 
                    label="My Lists"
                    icon={<BookmarkIcon />}
                    isActive={currentView === AppView.WATCHLIST}
                    onClick={() => setCurrentView(AppView.WATCHLIST)}
                />
                <TabButton 
                    label="Friends"
                    icon={<UsersIcon />}
                    isActive={currentView === AppView.FRIENDS}
                    onClick={() => setCurrentView(AppView.FRIENDS)}
                />
            </div>
        </div>

        <div className="animate-fade-in">
            {renderView()}
        </div>
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by React, Tailwind, and Gemini AI.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <WatchlistProvider>
    <AppContent />
  </WatchlistProvider>
);


export default App;
