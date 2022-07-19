import Analytics from 'analytics';

export function captureSentryHttpFailure(event: CustomEvent) {
  try {
    Analytics.track('sentry_http_failure', {
      data: {
        error: event.detail,
      },
    });
  } catch (e) {}
}
