import { Writable, writable } from 'svelte/store';

export const elements: Writable<NavStack.StackElement[]> = writable([]);
export const overlays: Writable<NavStack.StackElement[]> = writable([]);
