import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const stack: Writable<NavStack.StackElement[]> = writable([]);
