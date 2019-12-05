import { writable } from 'svelte/store';

export const action = writable(false);
export const addFunds = writable(false);
export const allowBack = writable(false);
export const allowResend = writable(true);
export const allowSkip = writable(true);
export const loading = writable(false);
export const maxlength = writable(6);
export const otp = writable('');
export const skipText = writable('Skip Saved Cards');
export const text = writable('');
