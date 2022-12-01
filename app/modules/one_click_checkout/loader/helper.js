import {
  loaderLabel,
  showLoader,
  loaderClass,
} from 'one_click_checkout/loader/store';

export function showLoaderView(labelText, className) {
  showLoader.set(true);
  loaderLabel.set(labelText || '');
  loaderClass.set(className || '');
}

export function hideLoaderView() {
  showLoader.set(false);
  loaderLabel.set('');
  loaderClass.set('');
}
