import { writable } from 'svelte/store';

export const action = writable(false);
export const addFunds = writable(false);
export const allowBack = writable(false);
export const allowResend = writable(true);
export const allowSkip = writable(true);
export const loading = writable(false);
export const maxlength = writable(6);
export const otp = writable('');
export const skipTextLabel = writable('skip_saved_cards');
export const templateData = writable({});
export const textView = writable('');
export const mode = writable('');
export const phone = writable('');
export const headingText = writable('');
export const resendTimeout = writable(0);
export const ipAddress = writable('');
export const accessTime = writable(0);
export const errorMessage = writable('');
export const digits = writable([]);
export const disableCTA = writable(false);
export const ctaLabel = writable('');
export const tabLogo = writable('');
export const renderCtaOneCC = writable(true);
export const isRazorpayOTP = writable(false);

export const showCtaOneCC = writable(false);
export const ctaOneCCDisabled = writable(false);
