import { writable } from 'svelte/store';
import RazorpayStore, { getOption } from 'razorpay';

RazorpayStore.subscribe((r) => {
  r && selectedWallet.set(getOption('prefill.wallet'));
});

export const selectedWallet = writable('');
