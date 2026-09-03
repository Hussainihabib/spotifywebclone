import { useAudioContext } from '../context/AudioContext';
import SongRow from '../components/SongRow';

/**
 * LibraryView
 * -----------
 * "Your Library" — surfaces the Liked Songs collection prominently
 * (since it's a first-class quick action in the sidebar) followed by
 * the full catalog, so every track is reachable from every view.
 */
export default function LibraryView() {
  const { likedSongs, allSongs } = useAudioContext();

  return (
    <div className="animate-fade-in px-6 pb-8 pt-6">
      <h1 className="mb-6 text-3xl font-extrabold text-white">Your Library</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-white">Liked Songs</h2>
        {likedSongs.length > 0 ? (
          <div className="flex flex-col">
            {likedSongs.map((song, index) => (
              <SongRow key={song.id} song={song} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-text-subdued">
            Songs you like will appear here. Tap the heart icon on any track to save it.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-white">All Songs</h2>
        <div className="flex flex-col">
          {allSongs.map((song, index) => (
            <SongRow key={song.id} song={song} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
