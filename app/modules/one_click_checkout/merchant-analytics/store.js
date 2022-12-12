import { isOneClickCheckout } from 'razorpay';
import { writable } from 'svelte/store';

export const moengageEventsData = writable({});

export function updateMoengageEventsData(updatedData) {
  if (!isOneClickCheckout()) {
    return;
  }
  moengageEventsData.update((prev) => {
    return { ...prev, ...updatedData };
  });
}
