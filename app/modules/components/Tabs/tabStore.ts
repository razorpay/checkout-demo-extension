import { writable } from 'svelte/store';

/**
 * This state is for selected tab value
 * And this is also used for the highlighting the current tab as well as showing appropriate content
 */
const selectedTabInitial = '';

export const selectedTab = writable(selectedTabInitial);
