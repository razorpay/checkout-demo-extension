const initCustomCheckout = require('blackbox/tests/custom/init.js');
const { describe } = require('jest-circus');

const GOOGLE_PAY_PACKAGE_NAME = 'com.google.android.apps.nbu.paisa.user';
const PHONE_PE_PACKAGE_NAME = 'com.phonepe.app';

const supportedAdapter = [
  'gpay',
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
  'microapps.gpay',
];

/** some dummy name */
const unsupportedAdapter = ['tezpay', 'paytm', 'whatsapp'];

describe('checkPaymentAdapter - Custom Checkout UT', () => {
  beforeEach(async () => {
    await initCustomCheckout({
      page,
      mockPaymentRequest: true,
      emulate: 'Pixel 2',
    });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });

  describe.each(supportedAdapter)('supported adapter case(%s)', (adapter) => {
    test(`adapter - ${adapter}`, async () => {
      const adapterStatus = await page.evaluate(async (adapaterInput) => {
        const rp = window.rp;
        let status = false;
        try {
          await rp.checkPaymentAdapter(adapaterInput);
          status = rp.paymentAdapters[adapaterInput];
        } catch {
          status = false;
        }
        return status;
      }, adapter);
      expect(adapterStatus).toBeTruthy();
    });
  });

  describe.each(unsupportedAdapter)(
    'unsupported adapter case(%s)',
    (adapter) => {
      test(`adapter - ${adapter}`, async () => {
        const adapterStatus = await page.evaluate(async (adapaterInput) => {
          const rp = window.rp;
          let status = false;
          try {
            await rp.checkPaymentAdapter(adapaterInput);
            status = rp.paymentAdapters[adapaterInput];
          } catch {
            status = false;
          }
          return status;
        }, adapter);
        expect(adapterStatus).toBeFalsy();
      });
    }
  );

  test('isTezAvailable', async () => {
    const adapterStatus = await page.evaluate(async () => {
      const rp = window.rp;
      let status = false;
      try {
        await rp.isTezAvailable();
        status = true;
      } catch {
        status = false;
      }
      return status;
    });
    expect(adapterStatus).toBeTruthy();
  });
});
