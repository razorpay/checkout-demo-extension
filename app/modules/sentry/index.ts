import { setContext } from './context';
import {
  SENTRY_RELEASE_VERSION,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
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
      dsn: SENTRY_DSN,
      release: SENTRY_RELEASE_VERSION,
      environment: SENTRY_ENVIRONMENT,
    });
    setContext();
  };

  document.body.appendChild(script);
}
