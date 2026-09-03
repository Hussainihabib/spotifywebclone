import { useMemo } from 'react';
import { useAudioContext } from '../context/AudioContext';
import SongCard from '../components/SongCard';

/** Returns a time-of-day appropriate greeting, like Spotify's own home page. */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * HomeView
 * --------
 * Landing page: a greeting banner, a "recently played" quick-access grid,
 * and a "Made For You" grid. Both grids reuse the same catalog, sliced
 * differently, since this is a mock-data build — a real backend would
 * supply distinct recommendation and history endpoints.
 */
export default function HomeView() {
  const { allSongs } = useAudioContext();
  const greeting = useMemo(getGreeting, []);

  const recentlyPlayed = allSongs.slice(0, 6);
  const madeForYou = [...allSongs].reverse().slice(0, 8);

  return (
    <div className="animate-fade-in px-6 pb-8 pt-6">
      <h1 className="mb-6 text-3xl font-extrabold text-white">{greeting}</h1>

      {/* Recently played quick-access grid */}
      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {recentlyPlayed.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </section>

      {/* Made For You */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Made For You</h2>
          <button className="text-xs font-bold uppercase tracking-wide text-text-subdued transition-colors hover:text-white">
            Show all
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {madeForYou.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>
    </div>
  );
}
