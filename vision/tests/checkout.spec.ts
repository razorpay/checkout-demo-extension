import { test, expect } from '../core';
import { setPreference } from '../helper';
import Options from '../mock/options';
import Preferences from '../mock/preferences';

test('basic test', async ({ page, util }) => {
  const options = Options.default;
  setPreference(util.router, options, Preferences.default);
  await util.openCheckout({
    options,
  });
  await page.waitForTimeout(1000);
  expect(await page.screenshot()).toMatchSnapshot();
});
