import { writable } from 'svelte/store';

export const headerVisible = writable(true);

export const headerHiddenOnScroll = writable(false);

export const shouldOverrideVisibleState = writable(true);
