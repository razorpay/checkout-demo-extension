import { writable } from 'svelte/store';
import { getOption, razorpayInstanceStore } from 'checkoutstore';

razorpayInstanceStore.subscribe(r => {
  r && selectedBank.set(getOption('prefill.bank'));
});

export const selectedBank = writable('');
