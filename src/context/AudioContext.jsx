import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import useAudio from '../hooks/useAudio';
import songs from '../data/songs.json';

const AudioContext = createContext(null);

/**
 * AudioProvider
 * -------------
 * Single source of truth for playback state across the entire app.
 * Mounted once at the root (see App.jsx) so it — and the underlying
 * <audio> element inside useAudio — never unmounts as the user
 * navigates between Home / Search / Library. That persistence is what
 * lets a song keep playing uninterrupted while the view changes.
 */
export function AudioProvider({ children }) {
  const [queue] = useState(songs); // the full catalog acts as the default queue
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [previousVolume, setPreviousVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  // repeatMode: 'off' | 'all' | 'one'
  const [repeatMode, setRepeatMode] = useState('off');
  const [likedSongIds, setLikedSongIds] = useState(() => new Set());

  // Keep a ref mirror of frequently-changing state that native event
  // handlers need to read without stale closures (repeat/shuffle logic
  // fires from the 'ended' event which is bound once inside useAudio).
  const stateRef = useRef({});
  stateRef.current = { currentSong, queue, isShuffle, repeatMode };

  const handleTimeUpdate = useCallback((time) => setCurrentTime(time), []);
  const handleLoadedMetadata = useCallback((dur) => setDuration(dur || 0), []);
  const handlePlay = useCallback(() => { setIsPlaying(true); setPlaybackError(''); }, []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleError = useCallback((message) => { setIsPlaying(false); setPlaybackError(message); }, []);

  const playSongAtIndex = useCallback(
    (index) => {
      const { queue: q } = stateRef.current;
      if (index < 0 || index >= q.length) return;
      const song = q[index];
      setCurrentSong(song);
      setIsPlaying(true);
      setCurrentTime(0);
      setPlaybackError('');
      load(song.audioSrc, { autoPlay: true }).catch((error) => {
        setIsPlaying(false);
        setPlaybackError(error?.message || 'Song could not be played.');
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleEnded = useCallback(() => {
    const { currentSong: cur, queue: q, isShuffle: shuffle, repeatMode: repeat } = stateRef.current;
    if (!cur) return;

    if (repeat === 'one') {
      seek(0);
      play();
      return;
    }

    const currentIndex = q.findIndex((s) => s.id === cur.id);
    let nextIndex;

    if (shuffle) {
      do {
        nextIndex = Math.floor(Math.random() * q.length);
      } while (q.length > 1 && nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= q.length) {
      if (repeat === 'all') {
        playSongAtIndex(0);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    playSongAtIndex(nextIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSongAtIndex]);

  const { load, play, pause, seek, setVolume: setAudioVolume } = useAudio({
    onTimeUpdate: handleTimeUpdate,
    onLoadedMetadata: handleLoadedMetadata,
    onEnded: handleEnded,
    onPlay: handlePlay,
    onPause: handlePause,
    onError: handleError,
  });

  /** Play a specific song object (from any view). Toggles if already loaded. */
  const playSong = useCallback(
    (song) => {
      const index = queue.findIndex((s) => s.id === song.id);
      if (index === -1) return;
      if (currentSong?.id === song.id) {
        if (isPlaying) {
          pause();
          setIsPlaying(false);
        } else {
          play().catch((error) => { setIsPlaying(false); setPlaybackError(error?.message || 'Song could not be played.'); });
        }
        return;
      }
      playSongAtIndex(index);
    },
    [queue, currentSong, isPlaying, pause, play, playSongAtIndex]
  );

  const togglePlayPause = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play().catch((error) => { setIsPlaying(false); setPlaybackError(error?.message || 'Song could not be played.'); });
    }
  }, [currentSong, isPlaying, pause, play]);

  const playNext = useCallback(() => {
    if (!currentSong) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (queue.length > 1 && nextIndex === currentIndex);
      playSongAtIndex(nextIndex);
      return;
    }
    const nextIndex = (currentIndex + 1) % queue.length;
    playSongAtIndex(nextIndex);
  }, [currentSong, queue, isShuffle, playSongAtIndex]);

  const playPrevious = useCallback(() => {
    if (!currentSong) return;
    // Spotify-like behaviour: if more than 3s into the track, restart it
    // instead of skipping to the previous song.
    if (currentTime > 3) {
      seek(0);
      setCurrentTime(0);
      return;
    }
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playSongAtIndex(prevIndex);
  }, [currentSong, currentTime, queue, seek, playSongAtIndex]);

  const seekTo = useCallback(
    (time) => {
      seek(time);
      setCurrentTime(time);
    },
    [seek]
  );

  const changeVolume = useCallback(
    (value) => {
      setVolumeState(value);
      setAudioVolume(value);
      setIsMuted(value === 0);
      if (value > 0) setPreviousVolume(value);
    },
    [setAudioVolume]
  );

  const toggleMute = useCallback(() => {
    if (isMuted) {
      changeVolume(previousVolume || 0.5);
    } else {
      setPreviousVolume(volume);
      changeVolume(0);
    }
  }, [isMuted, previousVolume, volume, changeVolume]);

  const toggleShuffle = useCallback(() => setIsShuffle((prev) => !prev), []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const toggleLikeSong = useCallback((songId) => {
    setLikedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  }, []);

  const isLiked = useCallback((songId) => likedSongIds.has(songId), [likedSongIds]);

  const likedSongs = useMemo(
    () => queue.filter((s) => likedSongIds.has(s.id)),
    [queue, likedSongIds]
  );

  const value = useMemo(
    () => ({
      allSongs: queue,
      currentSong,
      isPlaying,
      playbackError,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      likedSongs,
      likedSongIds,
      isLiked,
      toggleLikeSong,
      playSong,
      togglePlayPause,
      playNext,
      playPrevious,
      seekTo,
      changeVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeatMode,
    }),
    [
      queue,
      currentSong,
      isPlaying,
      playbackError,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      likedSongs,
      likedSongIds,
      isLiked,
      toggleLikeSong,
      playSong,
      togglePlayPause,
      playNext,
      playPrevious,
      seekTo,
      changeVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeatMode,
    ]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

/** Convenience hook for consuming the audio context anywhere in the tree. */
export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return ctx;
}
