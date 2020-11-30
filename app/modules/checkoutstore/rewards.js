import { writable, get } from 'svelte/store';

export const isRewardsVisible = writable(false);

export const rewards = writable([]);
