import { writable, Writable } from 'svelte/store';

export const gstinErrCount: Writable<number> = writable(0);
export const gstIn: Writable<string> = writable('');
export const isGstInValid = writable(true);
export const orderInstruction: Writable<string> = writable('');
export const prevGSTIN: Writable<string> = writable('');
export const prevOrderInstruction: Writable<string> = writable('');
