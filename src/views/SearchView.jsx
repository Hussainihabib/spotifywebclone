import { useState, useMemo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useAudioContext } from '../context/AudioContext';
import SongRow from '../components/SongRow';

/**
 * SearchView
 * ----------
 * Instant, client-side search across title and artist. Filtering is
 * pure derived state (useMemo) — no debounce is needed since the mock
 * catalog is small, but the memo keeps the filter from re-running on
 * unrelated re-renders (e.g. playback ticking currentTime every second).
 */
export default function SearchView() {
  const { allSongs } = useAudioContext();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allSongs;
    return allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(trimmed) || song.artist.toLowerCase().includes(trimmed)
    );
  }, [allSongs, query]);

  return (
    <div className="animate-fade-in px-6 pb-8 pt-6">
      <h1 className="mb-6 text-3xl font-extrabold text-white">Search</h1>

      {/* Search input */}
      <div className="relative mb-8 max-w-md">
        <SearchIcon
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-black"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          autoFocus
          className="w-full rounded-full bg-white py-3 pl-10 pr-10 text-sm font-medium text-app-black
                     placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-app-black transition-opacity hover:opacity-70"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="flex flex-col">
          {/* Column headers, matching the SongRow grid template */}
          <div className="grid grid-cols-[2rem_1fr_minmax(0,1fr)_5rem_3rem] gap-4 border-b border-border-subtle px-4 pb-2 text-xs font-medium uppercase tracking-wide text-text-subdued">
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span className="text-right">Time</span>
            <span />
          </div>
          <div className="mt-2 flex flex-col">
            {results.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-text-subdued">
          No results for &ldquo;{query}&rdquo;. Try searching something else.
        </p>
      )}
    </div>
  );
}
