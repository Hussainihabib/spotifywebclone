/** Format a duration in seconds as m:ss (e.g. 154 -> "2:34"). Handles NaN/undefined safely. */
export default function formatTime(totalSeconds) {
  if (!totalSeconds || Number.isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}
