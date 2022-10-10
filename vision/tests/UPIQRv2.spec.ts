import { test, expect } from '../core';
import { setPreference } from '../helper';
import Options from '../mock/options';
import Preferences from '../mock/preferences';

test.describe.configure({ mode: 'parallel' });
test.describe('UPI QR V2 API', () => {
  test('UPI QR V2 API - success', async ({ page, util }) => {
    const options = Options({
      prefill: {
        email: 'test@razorpay.com',
        contact: '+919999999999',
      },
    });
    setPreference(
      util.router,
      options,
      Preferences({
        experiments: {
          upi_qr_v2: true,
        },
      })
    );
    util.router.post(
      `https://api.razorpay.com/v1/checkout/order?key_id=${options.key}`,
      {
        status: 'active',
        id: 'GFZIYx6rMbP6gs',
        qr_code: {
          id: 'qr_GFZIYx6rMbP6gs',
          type: 'upi_qr',
          name: 'More megastore',
          image_content:
            'upi://pay?ver=01&mode=15&pa=rzr.qrtestaccoun27230053@icici&pn=TestAccount&tr=RZPIXnO3BgccsO35Qqrv2&tn=PaymenttoTestAccount&cu=INR&mc=1234&qrMedium=04&am=123.45', // intent_url
          usage: 'single',
          fixed_amount: true,
          payment_amount: 100,
          description: 'Fine T-Shirt',
          customer_id: 'cust_CtqVT5hl9czGsG',
          close_by: 1681615838,
          notes: {
            purpose: 'Test UPI QR code notes',
          },
          request: {
            url: 'https://api.razorpay.com/v1/checkout/qr_code/qr_GFZIYx6rMbP6gs/payment/status?key_id=rzp_live_ILgsfZCZoFIKMb',
            method: 'GET',
          },
          status: 'active',
          close_reason: 'on_demand',
          payments_count_received: 100,
          payments_amount_received: 34500,
          closed_at: null,
          created_at: 1603942055,
        },
      },
      { partialMatch: true }
    );
    await util.openCheckout({
      options,
    });
    await page.waitForTimeout(200);
    expect(await page.screenshot()).toMatchSnapshot({
      maxDiffPixelRatio: 0.02,
    }); // due to loading animation (screenshot might change)
    util.router.get(
      `https://api.razorpay.com/v1/checkout/qr_code/qr_GFZIYx6rMbP6gs/payment/status?key_id=${options.key}`,
      {
        status: {
          status: 'created',
        },
      },
      { partialMatch: true }
    );
    await page.waitForTimeout(6000);
    expect(await page.screenshot()).toMatchSnapshot();
    // 6 sec interval
    util.router.get(
      `https://api.razorpay.com/v1/checkout/qr_code/qr_GFZIYx6rMbP6gs/payment/status?key_id=${options.key}`,
      {
        status: {
          razorpay_payment_id: 'pay_',
        },
      },
      { partialMatch: true }
    );
  });

  test('UPI QR V2 API - failure', async ({ page, util }) => {
    const options = Options({
      prefill: {
        email: 'test@razorpay.com',
        contact: '+919999999999',
      },
    });
    setPreference(
      util.router,
      options,
      Preferences({
        experiments: {
          upi_qr_v2: true,
        },
      })
    );
    util.router.post(
      `https://api.razorpay.com/v1/checkout/order?key_id=${options.key}`,
      {
        status: 'inactive',
      },
      { partialMatch: true }
    );
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
    setPreference(
      util.router,
      options,
      Preferences({
        experiments: {
          upi_qr_v2: false,
        },
      })
    );
    await util.openCheckout({
      options,
    });
    await page.waitForTimeout(4000);
    expect(await page.screenshot()).toMatchSnapshot();
  });
});
