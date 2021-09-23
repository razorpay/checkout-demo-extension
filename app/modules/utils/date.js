export function getMonthDiff(timestamp) {
  let diff = new Date() - new Date(timestamp * 1000);
  diff = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  return diff;
}
