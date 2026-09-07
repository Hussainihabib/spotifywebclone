import { useEffect, useState } from 'react';
import { Menu, Search, UserCircle } from 'lucide-react';
import { AudioProvider, useAudioContext } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';
import PlayerView from './views/PlayerView';

function AppContent() {
  const [activeView, setActiveView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentSong } = useAudioContext();

  // Selecting a song opens the dedicated Now Playing page.
  useEffect(() => {
    if (currentSong) setActiveView('player');
  }, [currentSong?.id]);

  const renderView = () => {
    switch (activeView) {
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'player':
        return <PlayerView onBack={() => setActiveView('home')} />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-app-black font-sans">
      <header className="flex h-16 min-h-16 items-center justify-between border-b border-border-subtle bg-app-black/95 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <Menu size={24} />
        </button>
        <button onClick={() => setActiveView('home')} className="flex items-center gap-2" aria-label="Spotify Home">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-brand-green" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.379 1.621.42.18.6.9.36 1.2zm.12-3.42C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.24z" /></svg>
          <span className="text-lg font-extrabold text-white">Spotify</span>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveView('search')} aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full text-text-subdued hover:bg-white/10 hover:text-white"><Search size={21} /></button>
          <button aria-label="Profile" className="hidden h-10 w-10 items-center justify-center rounded-full text-text-subdued hover:bg-white/10 hover:text-white sm:flex"><UserCircle size={22} /></button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={setActiveView} mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="main-scroll flex-1 overflow-y-auto bg-gradient-to-b from-surface-highlight/40 to-app-black">
          {renderView()}
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}
