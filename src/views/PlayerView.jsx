import { useMemo } from 'react';
import {
  ArrowLeft,
  Heart,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
} from 'lucide-react';
import { useAudioContext } from '../context/AudioContext';
import SongCard from '../components/SongCard';
import formatTime from '../utils/formatTime';

function getRelatedSongs(currentSong, allSongs) {
  if (!currentSong) return [];
  const artistTokens = currentSong.artist.toLowerCase().split(/[\s,&]+/).filter(Boolean);

  return allSongs
    .filter((song) => song.id !== currentSong.id)
    .map((song) => {
      const artistMatch = artistTokens.some((token) =>
        token.length > 2 && song.artist.toLowerCase().includes(token)
      );
      const albumMatch = song.album === currentSong.album;
      const titleWords = currentSong.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const titleMatch = titleWords.some((word) => song.title.toLowerCase().includes(word));

      return {
        song,
        score: (artistMatch ? 5 : 0) + (albumMatch ? 2 : 0) + (titleMatch ? 1 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ song }) => song);
}

function SeekBar({ currentTime, duration, onSeek }) {
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-full">
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => onSeek(Number(e.target.value))}
        disabled={!duration}
        aria-label="Seek"
        className="player-range w-full"
        style={{ '--progress': `${percent}%` }}
      />
      <div className="mt-1 flex justify-between text-xs text-text-subdued">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default function PlayerView({ onBack }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isLiked,
    toggleLikeSong,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playbackError,
    allSongs,
  } = useAudioContext();

  const relatedSongs = useMemo(
    () => getRelatedSongs(currentSong, allSongs),
    [currentSong, allSongs]
  );

  if (!currentSong) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 pb-28">
        <div className="text-center">
          <p className="mb-4 text-text-subdued">No song is currently selected.</p>
          <button onClick={onBack} className="rounded-full bg-white px-5 py-2 font-semibold text-black">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className="min-h-full animate-fade-in px-5 pb-32 pt-5 sm:px-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-text-subdued transition-colors hover:text-white"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <section className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.03] p-5 shadow-2xl sm:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(280px,420px)_1fr]">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="aspect-square overflow-hidden rounded-xl shadow-2xl">
              <img
                src={currentSong.coverImage}
                alt={`${currentSong.title} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-green">
              Now Playing
            </p>
            <h1 className="break-words text-4xl font-extrabold text-white sm:text-5xl">
              {currentSong.title}
            </h1>
            <p className="mt-3 text-xl text-text-subdued">{currentSong.artist}</p>
            <p className="mt-1 text-sm text-text-muted">{currentSong.album}</p>

            <div className="mt-8">
              <SeekBar currentTime={currentTime} duration={duration} onSeek={seekTo} />
            </div>

            <div className="mt-7 flex items-center justify-center gap-6">
              <button
                onClick={toggleShuffle}
                aria-label="Shuffle"
                className={isShuffle ? 'text-brand-green' : 'text-text-subdued hover:text-white'}
              >
                <Shuffle size={20} />
              </button>
              <button onClick={playPrevious} aria-label="Previous" className="text-white hover:scale-105">
                <SkipBack size={24} fill="currentColor" />
              </button>
              <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={playNext} aria-label="Next" className="text-white hover:scale-105">
                <SkipForward size={24} fill="currentColor" />
              </button>
              <button
                onClick={cycleRepeatMode}
                aria-label="Repeat"
                className={repeatMode !== 'off' ? 'text-brand-green' : 'text-text-subdued hover:text-white'}
              >
                <RepeatIcon size={20} />
              </button>
            </div>

            <div className="mt-7 flex items-center gap-5">
              <button
                onClick={() => toggleLikeSong(currentSong.id)}
                className={isLiked(currentSong.id) ? 'text-brand-green' : 'text-text-subdued hover:text-white'}
                aria-label="Like song"
              >
                <Heart size={21} fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} />
              </button>

              <div className="flex flex-1 items-center gap-2">
                <button onClick={toggleMute} className="text-text-subdued hover:text-white" aria-label="Mute">
                  {isMuted || volume === 0 ? <VolumeX size={19} /> : volume < 0.5 ? <Volume1 size={19} /> : <Volume2 size={19} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="player-range w-full"
                  style={{ '--progress': `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>

            {playbackError && (
              <p className="mt-5 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-300">
                {playbackError}
              </p>
            )}
          </div>
        </div>
      </section>

      {relatedSongs.length > 0 && (
        <section className="mx-auto mt-10 max-w-6xl">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white">You May Also Like</h2>
            <p className="mt-1 text-sm text-text-subdued">Songs related to {currentSong.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {relatedSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
