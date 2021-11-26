import { tryOpeningIntentUrl } from '../helper';

jest.mock('checkoutstore', () => ({
  getMerchantKey: () => '',
}));

describe('#tryOpeningIntentUrl', () => {
  const intentUrl = 'valid-intent-url';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  function finishTimeout() {
    jest.advanceTimersByTime(2000);
  }

  it('should open popup with passed intent url', () => {
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);
    tryOpeningIntentUrl(intentUrl);
    finishTimeout();

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(intentUrl, '_blank');
  });

  it('should resolve after 2 seconds', async () => {
    const timeout = 2000;
    jest.spyOn(window, 'open').mockReturnValue(null);
    let done = false;

    const canProceed = tryOpeningIntentUrl(intentUrl);
    canProceed.then(() => (done = true));

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), timeout);

    expect(done).toEqual(false);

    jest.advanceTimersByTime(timeout);
    await canProceed;

    expect(done).toEqual(true);
  });

  describe('when popup is available', () => {
    describe('and automatically closed', () => {
      it('should resolve as `true`', async () => {
        const proxyWindow = {
          closed: true,
        };
        jest.spyOn(window, 'open').mockReturnValue(proxyWindow);

        const canProceed = tryOpeningIntentUrl(intentUrl);
        finishTimeout();

        await expect(canProceed).resolves.toBeTruthy();
      });
    });

    describe('and did not close automatically', () => {
      it('should resolve as `false`', async () => {
        const proxyWindow = {
          closed: false,
          close: jest.fn(),
        };
        jest.spyOn(window, 'open').mockReturnValue(proxyWindow);

        const canProceed = tryOpeningIntentUrl(intentUrl);
        finishTimeout();

        await expect(canProceed).resolves.toBeFalsy();
      });

      it('should close the popup', async () => {
        const proxyWindow = {
          closed: false,
          close: jest.fn(),
        };
        jest.spyOn(window, 'open').mockReturnValue(proxyWindow);

        tryOpeningIntentUrl(intentUrl);
        finishTimeout();

        expect(proxyWindow.close).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when popup is not available', () => {
    it('should resolve as true', async () => {
      const proxyWindow = null;
      jest.spyOn(window, 'open').mockReturnValue(proxyWindow);

      const canProceed = tryOpeningIntentUrl(intentUrl);
      finishTimeout();

      await expect(canProceed).resolves.toBeTruthy();
    });
  });
});
