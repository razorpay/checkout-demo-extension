import { getSession } from 'sessionmanager';

/**
 * Returns the animation duration that should be used.
 * This has to be used for all svelte animation duration and delays.
 * @param {number} duration
 *
 * @returns {number}
 */
export function getAnimationDuration(duration) {
  const session = getSession();
  const disableAnimations = session && !session.get('modal.animation');

  if (disableAnimations) {
    return 0;
  } else {
    return duration;
  }
}
