import { test } from '../core';

test.describe.configure({ mode: 'parallel' });
test.describe('UPI QR V2 API', () => {
  test('UPI QR V2 API - success', async ({ page, util }) => {
    await util.openCheckout({
      options: util.prepareOptions({
        prefill: {
          email: 'test@razorpay.com',
          contact: '+919999999999',
        },
      }),
    });
    await page.waitForTimeout(1000);
    await util.matchScreenshot({
      matchScreenShortArgument: {
        maxDiffPixelRatio: 0.02,
      },
    }); // maxDiffPixelRatio due to loading animation (screenshot might change)
    await page.waitForTimeout(6000);
    await util.matchScreenshot();

    // 6 sec interval
    util.updateContext({
      apiOverrides: {
        checkoutOrderStatus: {
          status: {
            razorpay_payment_id: 'pay_',
          },
        },
      },
    });
  });

  test('UPI QR V2 API - failure', async ({ page, util }) => {
    util.updateContext({
      apiOverrides: {
        checkoutOrder: () => {
          return {
            status: 'inactive',
          };
        },
      },
    });

    await util.openCheckout({
      options: util.prepareOptions({
        prefill: {
          email: 'test@razorpay.com',
          contact: '+919999999999',
        },
      }),
    });
    await page.waitForTimeout(3500);
    await util.matchScreenshot();
  });

  test('UPI QR V2 API - experiment disable', async ({ page, util }) => {
    util.updateContext({
      apiOverrides: {
        preferences: (pref) => ({
          ...pref,
          experiments: {
            ...pref.experiments,
            upi_qr_v2: false,
          },
        }),
      },
    });

    await util.openCheckout({
      options: util.prepareOptions({
        prefill: {
          email: 'test@razorpay.com',
          contact: '+919999999999',
        },
      }),
    });
    await page.waitForTimeout(3500);
    await util.matchScreenshot();
  });
});
