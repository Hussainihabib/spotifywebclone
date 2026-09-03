import { Play, Pause, Heart } from 'lucide-react';
import { useAudioContext } from '../context/AudioContext';
import formatTime from '../utils/formatTime';

/**
 * SongRow
 * -------
 * A single track row for list-style views: index/play indicator, cover
 * thumbnail, title/artist, album, duration, and a like toggle.
 */
export default function SongRow({ song, index }) {
  const { currentSong, isPlaying, playSong, isLiked, toggleLikeSong } = useAudioContext();
  const isCurrent = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => playSong(song)}
      onKeyDown={(e) => e.key === 'Enter' && playSong(song)}
      className="group grid grid-cols-[2rem_1fr_minmax(0,1fr)_5rem_3rem] items-center gap-4 rounded-md
                 px-4 py-2 transition-colors hover:bg-white/10 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {/* Index / play indicator */}
      <div className="flex w-8 items-center justify-center text-sm text-text-subdued">
        {isCurrent && isPlaying ? (
          <Pause size={16} className="text-brand-green" fill="currentColor" />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play size={16} className="hidden group-hover:block" fill="currentColor" />
          </>
        )}
      </div>

      {/* Cover + title/artist */}
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={song.coverImage}
          alt={`${song.album} cover`}
          className="h-10 w-10 shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${isCurrent ? 'text-brand-green' : 'text-white'}`}>
            {song.title}
          </p>
          <p className="truncate text-xs text-text-subdued">{song.artist}</p>
        </div>
      </div>

      {/* Album */}
      <p className="truncate text-sm text-text-subdued">{song.album}</p>

      {/* Duration */}
      <p className="text-right text-sm text-text-subdued">{formatTime(song.duration)}</p>

      {/* Like toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleLikeSong(song.id);
        }}
        aria-label={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        className={`flex h-8 w-8 items-center justify-center justify-self-end rounded-full transition-colors
                    ${liked ? 'text-brand-green' : 'text-text-subdued hover:text-white'}`}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
