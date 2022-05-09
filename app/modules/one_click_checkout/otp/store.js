import { writable } from 'svelte/store';

export const resendAttemptIndex = writable(0); // Count of how many times resend is clicked

export const submitAttemptIndex = writable(0); // Count of how many times OTP submit is clicked
