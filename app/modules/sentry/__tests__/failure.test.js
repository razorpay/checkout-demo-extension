import Analytics from 'analytics/base-analytics';
import { captureSentryHttpFailure } from 'sentry/failure';

jest.mock('analytics/base-analytics');

describe('Sentry HTTP Failure handler', () => {
  it('should gracefully push data to looker', () => {
    captureSentryHttpFailure(
      new CustomEvent('sentry_http_failure', {
        detail: new Error('An exception occurred.'),
      })
    );
    Analytics.track.mockReturnValue(true);

    expect(Analytics.track).toHaveBeenCalled();
  });

  it('should silently fail if analytics fails', () => {
    const returnValue = captureSentryHttpFailure(
      new CustomEvent('sentry_http_failure', {
        detail: new Error('An exception occurred.'),
      })
    );
    Analytics.track.mockImplementation(() => {
      throw new Error('Unexpected error occured');
    });

    expect(returnValue).toBe(undefined);
  });
});
