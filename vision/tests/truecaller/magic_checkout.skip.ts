import { test, expect } from '../../core';
import { Address } from '../../mock/api/address';
import Options from '../../mock/options';

test.use({
  userAgent:
    'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
});

test('basic test', async ({ page, util }) => {
  await util.router.setContext({
    features: {
      one_click_checkout: true,
    },
    addresses: [Address()],
    serviceable: ['560030'],
    truecaller: true,
  });
  const options = Options({
    order_id: 'order_test_one_cc',
    features: {
      truecaller_login: true,
    },
  });
  await util.openCheckout({
    options,
  });
  await page.evaluate(() => {
    window.opener.postMessage = function (message) {
      if (typeof message === 'string') {
        message = JSON.parse(message);
      }

      if (message.topic === 'trigger_truecaller_intent') {
        // programmatically blur window to mock truecaller
        window.postMessage(
          JSON.stringify({
            topic: 'trigger_truecaller_intent:finished',
            data: {
              data: { focused: false },
              id: 'unique_interface_id',
              source: 'checkoutjs',
            },
            time: Date.now(),
            source: 'checkoutjs',
            _module: 'interface',
          }),
          '*'
        );
      }
    };
  });

  // check truecaller loader is being displayed
  expect(await page.waitForSelector('#loader-modal')).toBeTruthy();

  // check address and contact details are filled
  expect(await page.waitForSelector('#delivery-address-widget')).toBeTruthy();
  expect(await page.getByText('+91 8888888888').first()).toBeTruthy();
  expect(await page.getByText('demo@razorpay.com').first()).toBeTruthy();
  await page.getByRole('button', { name: 'Continue' }).click();

  // continue with payments
  await page.locator('[data-appid="others"]').click();
  await page.locator('#new-vpa-field-upi').click();
  await page.locator('input[name="vpa-upi"]').fill('demo@upi');
  await page.getByRole('button', { name: 'Pay Now' }).click();
});
