import { loaderLabel, showLoader } from 'one_click_checkout/loader/store';

export function showLoaderView(labelText) {
  showLoader.set(true);
  loaderLabel.set(labelText || '');
}

export function hideLoaderView() {
  showLoader.set(false);
  loaderLabel.set('');
}
