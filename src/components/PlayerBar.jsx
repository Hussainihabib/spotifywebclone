import { useState, useRef, useCallback } from 'react';
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
} from 'lucide-react';
import { useAudioContext } from '../context/AudioContext';
import formatTime from '../utils/formatTime';

/**
 * SeekBar
 * -------
 * A click-and-drag progress bar. Renders a thin track that fills up to
 * `progress` (0-100) with a draggable thumb. Dragging tracks the mouse
 * across the whole document so the scrub doesn't stop if the cursor
 * leaves the bar's bounding box mid-drag.
 */
function SeekBar({ currentTime, duration, onSeek }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const progress = duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0;

  const timeFromClientX = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track || !duration) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const time = timeFromClientX(e.clientX);
    setDragTime(time);

    const handlePointerMove = (moveEvent) => {
      setDragTime(timeFromClientX(moveEvent.clientX));
    };
    const handlePointerUp = (upEvent) => {
      const finalTime = timeFromClientX(upEvent.clientX);
      onSeek(finalTime);
      setIsDragging(false);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
  };

  return (
    <div className="flex w-full items-center gap-2">
      <span className="w-10 shrink-0 text-right text-xs text-text-subdued tabular-nums">
        {formatTime(isDragging ? dragTime : currentTime)}
      </span>
      <div
        ref={trackRef}
        onMouseDown={handlePointerDown}
        className="group/seek relative h-3 flex-1 cursor-pointer select-none"
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={isDragging ? dragTime : currentTime}
      >
        {/* Track background, vertically centered inside the taller hit area */}
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/20">
          <div
            className={`relative h-full rounded-full bg-white group-hover/seek:bg-brand-green ${
              isDragging ? 'bg-brand-green' : ''
            }`}
            style={{ width: `${progress}%` }}
          >
            <div
              className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow
                          ${isDragging ? 'opacity-100' : 'opacity-0 group-hover/seek:opacity-100'}`}
            />
          </div>
        </div>
      </div>
      <span className="w-10 shrink-0 text-xs text-text-subdued tabular-nums">{formatTime(duration)}</span>
    </div>
  );
}

/**
 * VolumeControl
 * -------------
 * Mute toggle + a draggable horizontal slider, styled to match the
 * seek bar's interaction model (click track / drag thumb).
 */
function VolumeControl() {
  const { volume, isMuted, changeVolume, toggleMute } = useAudioContext();
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayedVolume = isMuted ? 0 : volume;

  const volumeFromClientX = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    changeVolume(volumeFromClientX(e.clientX));

    const handlePointerMove = (moveEvent) => changeVolume(volumeFromClientX(moveEvent.clientX));
    const handlePointerUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="text-text-subdued transition-colors hover:text-white"
      >
        <VolumeIcon size={18} />
      </button>
      <div
        ref={trackRef}
        onMouseDown={handlePointerDown}
        className="group/vol relative h-3 w-24 cursor-pointer select-none"
        role="slider"
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={displayedVolume}
      >
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/20">
          <div
            className={`relative h-full rounded-full bg-white group-hover/vol:bg-brand-green ${
              isDragging ? 'bg-brand-green' : ''
            }`}
            style={{ width: `${displayedVolume * 100}%` }}
          >
            <div
              className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow
                          ${isDragging ? 'opacity-100' : 'opacity-0 group-hover/vol:opacity-100'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PlayerBar
 * ---------
 * The persistent, full-width transport bar fixed to the bottom of the
 * viewport. Reads all state from AudioContext — nothing here owns
 * playback state itself, it only dispatches actions.
 */
export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    playbackError,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isLiked,
    toggleLikeSong,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeatMode,
  } = useAudioContext();

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const liked = currentSong ? isLiked(currentSong.id) : false;

  return (
    <footer title={playbackError || undefined} className="relative grid h-22 min-h-[5.5rem] w-full grid-cols-3 items-center gap-4 border-t border-border-subtle bg-surface-base px-4 py-3">
      {playbackError && <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 rounded bg-red-500 px-4 py-2 text-sm text-white shadow-lg">{playbackError}</div>}

      {/* Left: now-playing info */}
      <div className="flex min-w-0 items-center gap-3">
        {currentSong ? (
          <>
            <img
              src={currentSong.coverImage}
              alt={`${currentSong.album} cover`}
              className="h-14 w-14 shrink-0 rounded object-cover shadow-card"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{currentSong.title}</p>
              <p className="truncate text-xs text-text-subdued">{currentSong.artist}</p>
            </div>
            <button
              onClick={() => toggleLikeSong(currentSong.id)}
              aria-label={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
              className={`ml-2 shrink-0 transition-colors ${liked ? 'text-brand-green' : 'text-text-subdued hover:text-white'}`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </>
        ) : (
          <p className="truncate text-sm text-text-muted">No track selected</p>
        )}
      </div>

      {/* Center: transport controls + seek bar */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={isShuffle}
            className={`transition-colors ${isShuffle ? 'text-brand-green' : 'text-text-subdued hover:text-white'}`}
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={playPrevious}
            aria-label="Previous track"
            disabled={!currentSong}
            className="text-text-subdued transition-colors hover:text-white disabled:opacity-40"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!currentSong}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black
                       transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={playNext}
            aria-label="Next track"
            disabled={!currentSong}
            className="text-text-subdued transition-colors hover:text-white disabled:opacity-40"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            onClick={cycleRepeatMode}
            aria-label="Toggle repeat mode"
            aria-pressed={repeatMode !== 'off'}
            className={`transition-colors ${repeatMode !== 'off' ? 'text-brand-green' : 'text-text-subdued hover:text-white'}`}
          >
            <RepeatIcon size={18} />
          </button>
        </div>
        <SeekBar currentTime={currentTime} duration={duration} onSeek={seekTo} />
      </div>

      {/* Right: volume */}
      <div className="flex items-center justify-end gap-3">
        <VolumeControl />
      </div>
    </footer>
  );
}
