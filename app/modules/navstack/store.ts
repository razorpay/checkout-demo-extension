import { Writable, writable } from 'svelte/store';

export const elements: Writable<NavStack.StackElement[]> = writable([]);
export const overlays: Writable<NavStack.StackElement[]> = writable([]);
export const overlaysRef: Writable<NavStack.StackElement[]> = writable([]);
export const elementRef: Writable<NavStack.StackElement | null> =
  writable(null);
export const isSessionControlled = writable(false);
