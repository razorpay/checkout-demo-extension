import { addMessages, init as initSvelteI18n } from 'svelte-i18n';

import en from './bundles/en';

export function init() {
  // Add bundled messages
  addMessages('en', en);

  // TODO: register for more languages

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale: 'en', // TODO: select from navigator
  });
}
