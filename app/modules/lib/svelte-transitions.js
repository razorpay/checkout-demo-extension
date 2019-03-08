export function fade(node, { delay = 0, duration = 400 }) {
  const o = +global.getComputedStyle(node).opacity;

  return {
    delay,
    duration,
    css: t => `opacity: ${t * o}`,
  };
}
