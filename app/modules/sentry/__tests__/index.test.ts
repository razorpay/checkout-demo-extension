import { isOneClickCheckout } from 'razorpay';
import * as Sentry from 'sentry';
import { SENTRY_CONFIG } from '../constants';

jest.mock('../context.ts');

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  __esModule: true,
  isOneClickCheckout: jest.fn(),
}));

describe('test #injectSentry', () => {
  test('injectSentry for razorpay Domain', () => {
    expect(1).toBeTruthy();
    delete (window as any).location;
    (window as any).location = new URL('https://api.razorpay.com');
    jest.spyOn(document, 'createElement');
    const scriptObject: any = {};
    (document.createElement as jest.Mock).mockReturnValue(scriptObject);
    window.Sentry = {
      init: jest.fn(),
    };

    // inject
    Sentry.injectSentry();

    expect(document.createElement).toBeCalledWith('script');
    expect(scriptObject.src).toContain('https://browser.sentry-cdn.com/');
    scriptObject.onload();
    expect(window.Sentry.init).toBeCalled();
    expect(window.Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: SENTRY_CONFIG.standard.SENTRY_DSN,
        environment: SENTRY_CONFIG.standard.SENTRY_ENVIRONMENT,
        release: SENTRY_CONFIG.standard.SENTRY_RELEASE_VERSION,
      })
    );
  });

  test('injectSentry for non razorpay Domain', () => {
    expect(1).toBeTruthy();
    delete (window as any).location;
    (window as any).location = new URL('https://example.com');
    jest.spyOn(document, 'createElement');

    // inject
    Sentry.injectSentry();

    expect(document.createElement).not.toBeCalled();
  });
});

describe('test #updateSentryConfig', () => {
  test('updateSentryConfig for magic', () => {
    (isOneClickCheckout as jest.Mock).mockReturnValueOnce(true);
    window.Sentry = {
      init: jest.fn(),
    };
    Sentry.updateSentryConfig();
    expect(window.Sentry.init).toBeCalled();
    expect(window.Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: SENTRY_CONFIG.magic.SENTRY_DSN,
        environment: SENTRY_CONFIG.magic.SENTRY_ENVIRONMENT,
        release: SENTRY_CONFIG.magic.SENTRY_RELEASE_VERSION,
      })
    );
  });

  test('updateSentryConfig for standard', () => {
    (isOneClickCheckout as jest.Mock).mockReturnValueOnce(false);
    window.Sentry = {
      init: jest.fn(),
    };
    Sentry.updateSentryConfig();
    expect(window.Sentry.init).toBeCalled();
    expect(window.Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: SENTRY_CONFIG.standard.SENTRY_DSN,
        environment: SENTRY_CONFIG.standard.SENTRY_ENVIRONMENT,
        release: SENTRY_CONFIG.standard.SENTRY_RELEASE_VERSION,
      })
    );
  });
});
