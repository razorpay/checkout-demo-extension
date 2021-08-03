import { getSession } from 'sessionmanager';

/**
 * Returns the animation duration that should be used.
 * This has to be used for all svelte animation duration and delays.
 * @param {number} duration
 *
 * @returns {number}
 */
function getAnimationDuration(duration) {
  const session = getSession();
  const disableAnimations = session && !session.get('modal.animation');

  if (disableAnimations) {
    return 0;
  } else {
    return duration;
  }
}

/**
 * Returns computed animation options
 * @param {Object} animationOptions
 *
 * @returns {Object}
 */
export function getAnimationOptions(animationOptions) {
  const durations = ['duration', 'delay'];

  _Arr.loop(durations, (property) => {
    if (!_.isUndefined(animationOptions[property])) {
      animationOptions[property] = getAnimationDuration(
        animationOptions[property]
      );
    }
  });

  return animationOptions;
}

/**
 * Returns a function that calls fn internally with the provided arguments,
 * all but the first time.
 *
 * @param {function} fn
 * @returns {function}
 */
export function ignoreFirstCall(fn) {
  let firstCallCompleted = false;
  return function ignored() {
    if (firstCallCompleted) {
      fn.apply(undefined, arguments);
    } else {
      firstCallCompleted = true;
    }
  };
}
