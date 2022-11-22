export function getMonthDiff(timestamp: number) {
  let diff = new Date().valueOf() - new Date(timestamp * 1000).valueOf();
  diff = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  return diff;
}

/**
 * Formats time from seconds to MM:SS format.
 * @returns string
 */
export function formatToMMSS(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
}
