import Toast from 'one_click_checkout/Toast/ui/Toast.svelte';

let toast;

/**
 * Creates a new Toast
 */
function create() {
  toast = new Toast({
    target: document.getElementById('bottom'),
  });
}

/**
 * Method to show the Toast
 * @param {Object} options which has delay, class, message for toast
 * @returns
 */
export function showToast(options) {
  if (!toast) {
    create();
  }
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
