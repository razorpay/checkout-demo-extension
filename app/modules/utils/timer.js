/**
 * Returns a function that returns the time
 * that has passed since this function was
 * invoked.
 *
 * @returns {function (): number}
 */
export const timer = () => {
  var then = Date.now();
  return () => Date.now() - then;
};
