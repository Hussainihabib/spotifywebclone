import { useState } from 'react';
import { AudioProvider } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';

/**
 * App
 * ---
 * Root component. AudioProvider wraps everything exactly once here, so
 * navigating between views only swaps what's rendered in the center
 * content area — it never remounts the provider or the <audio> element
 * inside it, which is what keeps playback uninterrupted across views.
 *
 * View routing is a simple local string + switch rather than a router
 * library, since there are only three top-level views and no deep
 * linking requirement in this brief.
 */
export default function App() {
  const [activeView, setActiveView] = useState('home');

  const renderView = () => {
    switch (activeView) {
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  return (
    <AudioProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-app-black font-sans">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeView={activeView} onNavigate={setActiveView} />
          <main className="main-scroll flex-1 overflow-y-auto bg-gradient-to-b from-surface-highlight/40 to-app-black">
            {renderView()}
          </main>
        </div>
        <PlayerBar />
      </div>
    </AudioProvider>
  );
}
