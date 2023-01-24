import { test, expect } from '../core';

test('basic test', async ({ page, util }) => {
  await util.openCheckout();
  await page.waitForTimeout(2000);
  expect(await page.screenshot()).toMatchSnapshot();
});
