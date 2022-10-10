import { Track } from 'analytics/base-analytics';
import { COMMIT_HASH, TRAFFIC_ENV } from 'common/constants';

export const SENTRY_CONFIG = {
  magic: {
    SENTRY_PUBLIC_KEY: '16be5f91f20c459cbfb51e421f4c9d2f',
    SENTRY_DOMAIN: 'o515678.ingest.sentry.io',
    SENTRY_BASE_URL: `https://o515678.ingest.sentry.io`,
    SENTRY_PROJECT_ID: '6398391',
    SENTRY_DSN: `https://16be5f91f20c459cbfb51e421f4c9d2f@o515678.ingest.sentry.io/6398391`,
    SENTRY_RELEASE_VERSION: COMMIT_HASH || 'magic-checkout@1.0.0',
    SENTRY_ENVIRONMENT: Track.props.env || TRAFFIC_ENV || 'staging',
  },
  standard: {
    SENTRY_PUBLIC_KEY: 'faa87b9121f2449cb849f27e4d737f35',
    SENTRY_DOMAIN: 'o515678.ingest.sentry.io',
    SENTRY_BASE_URL: `https://o515678.ingest.sentry.io`,
    SENTRY_PROJECT_ID: '4503925471707136',
    SENTRY_DSN: `https://faa87b9121f2449cb849f27e4d737f35@o515678.ingest.sentry.io/4503925471707136`,
    SENTRY_RELEASE_VERSION: COMMIT_HASH || 'standard-checkout@1.0.0',
    SENTRY_ENVIRONMENT: Track.props.env || TRAFFIC_ENV || 'staging',
  },
};
