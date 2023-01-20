import { test, expect } from '../core';
import Options from '../mock/options';

test('basic test', async ({ page, util }) => {
  const options = Options();
  await util.openCheckout({
    options,
  });
  await page.waitForTimeout(2000);
  expect(await page.screenshot()).toMatchSnapshot();
});
