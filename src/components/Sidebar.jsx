import { useMemo } from 'react';
import { Home, Search, Library, Plus, Heart, X } from 'lucide-react';
import { useAudioContext } from '../context/AudioContext';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Your Library', icon: Library },
];

/**
 * Sidebar
 * -------
 * Fixed-width navigation rail. `activeView` / `onNavigate` drive the
 * center content router in App.jsx. The playlist list is derived from
 * the mock catalog's unique albums so it's real, scrollable content
 * rather than static placeholders.
 */
export default function Sidebar({ activeView, onNavigate, mobileOpen = false, onClose = () => {} }) {
  const { allSongs, likedSongs } = useAudioContext();

  const playlists = useMemo(() => {
    const seen = new Map();
    allSongs.forEach((song) => {
      if (!seen.has(song.album)) {
        seen.set(song.album, { name: song.album, artist: song.artist, cover: song.coverImage });
      }
    });
    return Array.from(seen.values());
  }, [allSongs]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-64 shrink-0 flex-col gap-2 bg-app-black p-2 lg:flex">
      {/* Brand + primary navigation */}
      <div className="rounded-lg bg-surface-base p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-green" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.379 1.621.42.18.6.9.36 1.2zm.12-3.42C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.24z" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight text-white">Spotify</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-4 rounded px-2 py-2 text-sm font-semibold transition-colors
                          ${activeView === id ? 'text-white' : 'text-text-subdued hover:text-white'}`}
            >
              <Icon size={22} strokeWidth={activeView === id ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Library panel: quick actions + scrollable playlist list */}
      <div className="flex flex-1 min-h-0 flex-col rounded-lg bg-surface-base p-4">
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 rounded px-2 py-2 text-sm font-semibold text-text-subdued transition-colors hover:text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-text-subdued text-app-black">
              <Plus size={16} strokeWidth={3} />
            </span>
            Create Playlist
          </button>
          <button
            onClick={() => onNavigate('library')}
            className="flex items-center gap-3 rounded px-2 py-2 text-sm font-semibold text-text-subdued transition-colors hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-blue-200 text-white">
              <Heart size={14} fill="white" />
            </span>
            Liked Songs
            {likedSongs.length > 0 && (
              <span className="ml-auto text-xs text-text-muted">{likedSongs.length}</span>
            )}
          </button>
        </div>

        <div className="my-4 h-px bg-border-subtle" />

        {/* Scrollable playlist list with the custom sleek scrollbar
            defined in index.css (.sidebar-scroll). */}
        <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto pr-1">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Playlists
          </p>
          <ul className="flex flex-col gap-1">
            {playlists.map((playlist) => (
              <li key={playlist.name}>
                <button
                  onClick={() => onNavigate('library')}
                  className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-surface-hover"
                >
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="h-10 w-10 shrink-0 rounded object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{playlist.name}</p>
                    <p className="truncate text-xs text-text-muted">
                      Playlist &middot; {playlist.artist}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>

      {/* Mobile / tablet drawer */}
      <div className={`fixed inset-0 z-[80] lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileOpen}>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className={`absolute inset-0 bg-black/70 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(85vw,20rem)] flex-col gap-2 bg-app-black p-2 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between rounded-lg bg-surface-base p-4">
            <div className="flex items-center gap-2 px-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-green" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.379 1.621.42.18.6.9.36 1.2zm.12-3.42C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.24z" />
              </svg>
              <span className="text-xl font-extrabold tracking-tight text-white">Spotify</span>
            </div>
            <button onClick={onClose} aria-label="Close menu" className="rounded-full p-2 text-text-subdued hover:bg-white/10 hover:text-white">
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-1 min-h-0 flex-col rounded-lg bg-surface-base p-4">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { onNavigate(id); onClose(); }}
                  className={`flex items-center gap-4 rounded px-2 py-3 text-sm font-semibold transition-colors ${activeView === id ? 'text-white bg-white/10' : 'text-text-subdued hover:bg-white/5 hover:text-white'}`}
                >
                  <Icon size={22} strokeWidth={activeView === id ? 2.5 : 2} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="my-4 h-px bg-border-subtle" />
            <button
              onClick={() => { onNavigate('library'); onClose(); }}
              className="flex items-center gap-3 rounded px-2 py-3 text-sm font-semibold text-text-subdued hover:bg-white/5 hover:text-white"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-blue-200 text-white">
                <Heart size={14} fill="white" />
              </span>
              Liked Songs
              {likedSongs.length > 0 && <span className="ml-auto text-xs text-text-muted">{likedSongs.length}</span>}
            </button>

            <p className="mb-2 mt-5 px-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Playlists</p>
            <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-1">
                {playlists.map((playlist) => (
                  <li key={playlist.name}>
                    <button onClick={() => { onNavigate('library'); onClose(); }} className="flex w-full items-center gap-3 rounded px-2 py-2 text-left hover:bg-surface-hover">
                      <img src={playlist.cover} alt={playlist.name} className="h-10 w-10 shrink-0 rounded object-cover" loading="lazy" />
                      <div className="min-w-0"><p className="truncate text-sm text-white">{playlist.name}</p><p className="truncate text-xs text-text-muted">Playlist &middot; {playlist.artist}</p></div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
