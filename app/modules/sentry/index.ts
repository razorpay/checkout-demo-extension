import { setContext } from './context';
import {
  SENTRY_PUBLIC_KEY,
  SENTRY_DOMAIN,
  SENTRY_PROJECT_ID,
  SENTRY_RELEASE_VERSION,
} from './constants';

export function injectSentry() {
  if (window.location.hostname !== 'api.razorpay.com') {
    return;
  }

  const script = document.createElement('script');

  script.src = 'https://browser.sentry-cdn.com/7.2.0/bundle.min.js';
  script.integrity =
    'sha384-yvW0r7aI4VkwNfs/eOzYsODvXkNVQon3MBtow61jPf/pOR166EPvTSNBr9nG3C3y';
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    window.Sentry.init({
      dsn: `https://${SENTRY_PUBLIC_KEY}@${SENTRY_DOMAIN}/${SENTRY_PROJECT_ID}`,
      release: SENTRY_RELEASE_VERSION,
    });
    setContext();
  };

  document.body.appendChild(script);
}
