import { writable } from 'svelte/store';

export const backdropVisible = writable(false);
/**
 * true: allow clicks to work
 * false: disable clicks
 */
export const backdropClick = writable(true);

export function showBackdrop() {
  backdropVisible.set(true);
}

export function hideBackdrop() {
  backdropVisible.set(false);
}

/**
 * To disable/enable the click events on the backdrop presented in the frame.
 * @param {boolean} status
 */
export function setBackdropClick(status) {
  backdropClick.set(status);
}
