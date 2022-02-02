import { writable, derived, get } from 'svelte/store';
import { TIMER_UPDATE_FREQUENCY } from 'upi/constants';

export const qrUrl = writable('');
export const qrExpanded = writable(true);
export const timer = writable();
export const fallBack = writable(false);

// getting a derived boolean based on whether the timer is expired or not
export const elapsed = derived(timer, ($timer) => $timer <= 0);

let interval;
//  creating a subscription to qrUrl as soon as it is set/updated we start/restart the timer
qrUrl.subscribe((url) => {
  if (interval) {
    clearInterval(interval);
  }
  if (url) {
    interval = setInterval(() => {
      if (get(timer) <= 0) {
        // clearing the timer as soon as it reaches zero seconds
        clearInterval(interval);
      }
      if (get(timer) > 0) {
        // reducing each second from timer and updating it as long as timer is above zero seconds
        timer.update((time) => time - 1);
      }
    }, TIMER_UPDATE_FREQUENCY);
  }
});
