import {
  addMessages,
  init as initSvelteI18n,
  register,
  isLoading,
} from 'svelte-i18n';

import en from './bundles/en';
import en2 from './bundles/en2';

import { getSession } from 'sessionmanager';

function fetchBundle(locale) {
  return new Promise(resolve => {
    setTimeout(() => resolve(en2), 3000);
  });
}

export function init() {
  // Add bundled messages
  addMessages('en', en);
  register('en2', () => fetchBundle('en2'));

  const session = getSession();

  isLoading.subscribe(value => {
    if (value) {
      // TODO: lock overlay and prevent dismissal
      session.showLoadError('Loading');
    } else {
      // TODO: fix this and remove try/catch
      try {
        session.hideOverlayMessage();
      } catch (e) {}
    }
  });

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale: 'en', // TODO: select from navigator
  });
}
