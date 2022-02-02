import { getOffersForTab } from 'checkoutframe/offers';
import {
  getOption,
  getPreferences,
  isCustomerFeeBearer,
  isPartialPayment,
} from 'razorpay';
import {
  tryOpeningIntentUrl,
  shouldShowNewQrFlow,
  createQR,
  paymentStatus,
} from '../helper';

import { getSession } from 'sessionmanager';

jest.mock('checkoutstore', () => ({
  getMerchantKey: () => '',
}));
jest.mock('razorpay', () => ({
  getOption: jest.fn(),
  isCustomerFeeBearer: jest.fn(),
  isPartialPayment: jest.fn(),
  getPreferences: jest.fn(),
}));
jest.mock('checkoutframe/offers/index', () => ({
  getOffersForTab: jest.fn(),
}));

jest.mock('common/helper', () => ({
  makeUrl: jest.fn(),
}));

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    sucessHandler: jest.fn(),
  }),
}));

describe('#tryOpeningIntentUrl', () => {
  const intentUrl = 'valid-intent-url';

  beforeEach(() => {
    jest.useFakeTimers('legacy');
    jest.spyOn(global, 'setTimeout');
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

        await expect(canProceed).resolves.toBe(true);
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

        await expect(canProceed).resolves.toBe(false);
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

      await expect(canProceed).resolves.toBe(true);
    });
  });
});
describe('#shouldShowNewQRFlow', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should return true ', () => {
    getOption.mockReturnValue(false);
    isCustomerFeeBearer.mockReturnValue(false);
    isPartialPayment.mockReturnValue(false);
    getOffersForTab.mockReturnValue([]);
    getPreferences.mockReturnValue(true);

    const shouldShow = shouldShowNewQrFlow();
    expect(shouldShow).toBeTruthy();
  });
});
describe('#createQR', () => {
  afterAll(() => {
    delete global.fetch.post;
  });
  const response = {
    id: 'qr_Il7gw9B44g4syD',
    image_content:
      'upi://pay?ver=01&mode=15&pa=rpy.qrtestrazorp39589201@icici&pn=TestRazorpay&tr=RZPIl7gw9B44g4syDqrv2&tn=PaymenttoTestRazorpay&cu=INR&mc=8062&qrMedium=04&am=1',
  };
  beforeEach(() => {
    global.fetch.post = function ({ callback }) {
      callback(response);
    };

    jest.resetAllMocks();
  });

  it('sucessCallBack should be called after response', async () => {
    const callBack = jest.fn();
    createQR(callBack);

    expect(callBack).toHaveBeenCalledWith(response);
  });
});

describe('#paymentStatus', () => {
  afterAll(() => {
    delete global.fetch;
  });
  const response = {
    razorpay_payment_id: 'pay_12233444555',
    status: 'captured',
  };
  let session = getSession();
  beforeEach(() => {
    global.fetch = function () {
      if (response.razorpay_payment_id) {
        session.sucessHandler(session, response);
      }
    };
  });
  const id = 'qr-id';
  it('successHandler should be called after response with payment_id', async () => {
    getOption.mockReturnValue(true);
    paymentStatus(id);
    expect(session.sucessHandler).toHaveBeenCalledTimes(1);
  });
});
