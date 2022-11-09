import { setContext } from './context';
import { SENTRY_CONFIG } from './constants';
import { isOneClickCheckout } from 'razorpay';
import type { Exception } from './interfaces';
import { filterUnWantedExceptions } from './helper';

let errorTracked = false;

function initSentry() {
  try {
    const { SENTRY_RELEASE_VERSION, SENTRY_DSN, SENTRY_ENVIRONMENT } =
      SENTRY_CONFIG[isOneClickCheckout() ? 'magic' : 'standard'];
    window.Sentry.init({
      dsn: SENTRY_DSN,
      release: SENTRY_RELEASE_VERSION,
      environment: SENTRY_ENVIRONMENT,
      beforeSend(event: any) {
        try {
          // filter checkout-frame.js error only
          if (event.exception && event.exception.values?.length > 0) {
            (event.exception as Exception).values = filterUnWantedExceptions(
              (event.exception as Exception).values
            );
          }
          if (!isOneClickCheckout()) {
            // track only one error per session for standard checkout
            if (errorTracked) {
              return false;
            }
            if (event.exception?.values?.length > 0) {
              errorTracked = true;
            } else {
              return false;
            }
          }
          return event;
        } catch (e) {
          //
        }
      },
    });
    setContext();
  } catch (e) {
    //e
  }
}

export function injectSentry() {
  try {
    if (window.location.hostname !== 'api.razorpay.com') {
      return;
    }

    const script = document.createElement('script');

    script.src = 'https://browser.sentry-cdn.com/7.2.0/bundle.min.js';
    script.integrity =
      'sha384-yvW0r7aI4VkwNfs/eOzYsODvXkNVQon3MBtow61jPf/pOR166EPvTSNBr9nG3C3y';
    script.crossOrigin = 'anonymous';
    script.onload = function () {
      updateSentryConfig();
    };

    document.body.appendChild(script);
  } catch (e) {
    //e
  }
}

export function updateSentryConfig(retry = 0) {
  try {
    if (typeof window.Sentry !== 'undefined' && window.Sentry.init) {
      initSentry();
      return;
    }
    if (retry > 6) {
      return;
    }
    // We inject sentry at mount of checkout-frame
    // so ideally we should not inject again just update config and context
    setTimeout(() => {
      updateSentryConfig(retry + 1);
    }, 500);
  } catch (e) {
    //e
  }
}
