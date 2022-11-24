import { init, addMessages } from 'svelte-i18n';
import en from 'i18n/bundles/en';

export default () => {
  addMessages('en-EN', en);
  init({
    fallbackLocale: 'en-EN',
  });
};
