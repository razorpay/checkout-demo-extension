import { test } from '../../core';
import Options from '../../mock/options';

test('basic test', async ({ page, util }) => {
  const options = Options();
  await util.openCheckout({
    options,
  });
  await page.waitForTimeout(1000);
  await util.assertContactDetailPage();
  await util.fillContactDetails();
  await util.clickCTA();
  // Go to Wallet
  await util.openMethodFromL0('wallet');
  await util.matchScreenshot();
  await util.clickCTA();
  await util.matchScreenshot();
  // select wallet - it should remove warning message
  await util.selectWallet('phonepe');
  await util.matchScreenshot();
});
