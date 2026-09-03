import { useRef, useEffect, useCallback } from 'react';

export default function useAudio({ onTimeUpdate, onLoadedMetadata, onEnded, onPlay, onPause, onError }) {
  const audioRef = useRef(null);

  if (!audioRef.current) {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.8;
    audioRef.current = audio;
  }

  const callbacksRef = useRef({ onTimeUpdate, onLoadedMetadata, onEnded, onPlay, onPause, onError });
  useEffect(() => {
    callbacksRef.current = { onTimeUpdate, onLoadedMetadata, onEnded, onPlay, onPause, onError };
  }, [onTimeUpdate, onLoadedMetadata, onEnded, onPlay, onPause, onError]);

  useEffect(() => {
    const audio = audioRef.current;
    const handlers = {
      timeupdate: () => callbacksRef.current.onTimeUpdate?.(audio.currentTime),
      loadedmetadata: () => callbacksRef.current.onLoadedMetadata?.(Number.isFinite(audio.duration) ? audio.duration : 0),
      ended: () => callbacksRef.current.onEnded?.(),
      play: () => callbacksRef.current.onPlay?.(),
      pause: () => callbacksRef.current.onPause?.(),
      error: () => {
        const code = audio.error?.code;
        const message = code === 4 ? 'This audio format or source is not supported.' : 'Audio could not be loaded. Check that the MP3 file exists and the path is correct.';
        callbacksRef.current.onError?.(message);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => audio.addEventListener(event, handler));
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => audio.removeEventListener(event, handler));
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  const load = useCallback(async (src, { autoPlay = true } = {}) => {
    const audio = audioRef.current;
    if (!src) throw new Error('No audio source provided');

    const absoluteSrc = new URL(src, window.location.href).href;
    if (audio.src !== absoluteSrc) {
      audio.pause();
      audio.src = src;
      audio.currentTime = 0;
      audio.load();
    }

    if (autoPlay) {
      await audio.play();
    }
  }, []);

  const play = useCallback(async () => audioRef.current.play(), []);
  const pause = useCallback(() => audioRef.current.pause(), []);
  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(Math.max(0, time), audio.duration);
  }, []);
  const setVolume = useCallback((value) => {
    audioRef.current.volume = Math.min(1, Math.max(0, Number(value) || 0));
  }, []);

  return { audioRef, load, play, pause, seek, setVolume };
}
