import { Play, Pause } from 'lucide-react';
import { useAudioContext } from '../context/AudioContext';

/**
 * SongCard
 * --------
 * Album-art card with a floating play button that appears on hover,
 * used in the Home view's "recently played" and "Made For You" grids.
 */
export default function SongCard({ song }) {
  const { currentSong, isPlaying, playSong } = useAudioContext();
  const isCurrent = currentSong?.id === song.id;

  return (
    <button
      onClick={() => playSong(song)}
      className="group relative flex flex-col gap-3 rounded-md bg-surface-raised p-4 text-left
                 transition-colors duration-300 hover:bg-surface-highlight focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded shadow-card">
        <img
          src={song.coverImage}
          alt={`${song.album} cover`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span
          className={`absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full
                      bg-brand-green text-black shadow-lg transition-all duration-300
                      ${
                        isCurrent
                          ? 'opacity-100 translate-y-0'
                          : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                      }
                      hover:scale-105 hover:bg-brand-green-hover`}
        >
          {isCurrent && isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </span>
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${isCurrent ? 'text-brand-green' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="mt-1 truncate text-xs text-text-subdued">{song.artist}</p>
      </div>
    </button>
  );
}
