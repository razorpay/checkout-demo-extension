import { writable } from 'svelte/store';

export const resendAttemptIndex = writable<number>(0); // Count of how many times resend is clicked

export const submitAttemptIndex = writable<number>(0); // Count of how many times OTP submit is clicked
