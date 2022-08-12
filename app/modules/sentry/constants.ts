export const SENTRY_PUBLIC_KEY = '16be5f91f20c459cbfb51e421f4c9d2f';

export const SENTRY_DOMAIN = 'o515678.ingest.sentry.io';

export const SENTRY_BASE_URL = `https://${SENTRY_DOMAIN}`;

export const SENTRY_PROJECT_ID = '6398391';

export const SENTRY_DSN = `https://${SENTRY_PUBLIC_KEY}@${SENTRY_DOMAIN}/${SENTRY_PROJECT_ID}`;

export const SENTRY_RELEASE_VERSION = 'magic-checkout@1.0.0';

export const SENTRY_ENVIRONMENT =
  window.location.hostname === 'api.razorpay.com' ? 'production' : 'staging';
