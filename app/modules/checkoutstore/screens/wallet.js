import { writable } from 'svelte/store';
import { getOption, razorpayInstanceStore } from 'checkoutstore';

razorpayInstanceStore.subscribe(r => {
  r && selectedWallet.set(getOption('prefill.wallet'));
});

export const selectedWallet = writable('');
