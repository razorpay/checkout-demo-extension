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
