import { writable } from 'svelte/store';

export const backdropVisible = writable(false);

export function showBackdrop() {
  backdropVisible.set(true);
}

export function hideBackdrop() {
  backdropVisible.set(false);
}
