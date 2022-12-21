import { test, expect } from '../core';
import Options from '../mock/options';

test.describe.configure({ mode: 'parallel' });
test.describe('UPI QR V2 API', () => {
  test('UPI QR V2 API - success', async ({ page, util }) => {
    const options = Options({
      prefill: {
        email: 'test@razorpay.com',
        contact: '+919999999999',
      },
    });
    await util.openCheckout({
      options,
    });
    await page.waitForTimeout(200);
    expect(await page.screenshot()).toMatchSnapshot({
      maxDiffPixelRatio: 0.02,
    }); // due to loading animation (screenshot might change)
    await page.waitForTimeout(6000);
    expect(await page.screenshot()).toMatchSnapshot();

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
    const options = Options({
      prefill: {
        email: 'test@razorpay.com',
        contact: '+919999999999',
      },
    });
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
      options,
    });
    await page.waitForTimeout(4000);
    expect(await page.screenshot()).toMatchSnapshot();
  });

  test('UPI QR V2 API - experiment disable', async ({ page, util }) => {
    const options = Options({
      prefill: {
        email: 'test@razorpay.com',
        contact: '+919999999999',
      },
    });

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
      options,
    });
    await page.waitForTimeout(4000);
    expect(await page.screenshot()).toMatchSnapshot();
  });
});
