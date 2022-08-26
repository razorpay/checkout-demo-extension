import Toast from 'one_click_checkout/Toast/ui/Toast.svelte';

let toast;

/**
 * Creates a new Toast
 */
function create(element) {
  toast = new Toast({
    target: document.getElementById(`form-${element}`),
  });
}

/**
 * Method to show the Toast
 * @param {Object} options which has delay, class, message for toast
 * @returns
 */
export function showToast(options) {
  const { screen } = options || {};
  create(screen);
  toast.show(options);
}

/**
 * Method to show the Toast after a given delay duration.
 * Use case: Loader destroy time and toast show-up time are overlapping.
 * - Need to isolate the animations so that it looks smooth.
 * @param {Object} options which has ttl, class, message for toast
 * @returns
 */
export function showToastAfterDelay(options, delay) {
  setTimeout(() => {
    const { screen } = options || {};
    create(screen);
    toast.show(options);
  }, delay);
}

export function hideToast() {
  if (!toast) {
    return;
  }
  if (toast.isVisible()) {
    toast.hide();
  }
}

export const TOAST_THEME = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
};

export const TOAST_SCREEN = {
  ONE_CC: 'home-1cc', // for 1CC screens
  COMMON: 'common', // for payment method screen
};
