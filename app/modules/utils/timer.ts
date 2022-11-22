/**
 * Returns a function that returns the time
 * that has passed since this function was
 * invoked.
 */
export const timer = () => {
  const then = Date.now();
  return () => Date.now() - then;
};
