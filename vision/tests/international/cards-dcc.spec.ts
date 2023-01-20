/**
 * This file covers the tests for Card DCC flows
 */

import { test } from '../../core';
import Options from '../../mock/options';

test.describe('DCC cards success cases', () => {
  test('Should load DCC UI', async ({ util, page }) => {
    const options = Options({});

    await util.openCheckout({
      options,
    });
    await page.waitForTimeout(1000);
    await util.fillContactDetails();
    await util.clickCTA();
    await util.openMethodFromL0('card');
    const isOTPForm = await page.locator('#form-otp').isVisible();
    if (isOTPForm) {
      await page.getByText('Skip Saved Cards').click();
    }

    await util.enterCardDetails({ cardNumber: '4242424242424242' });
    await util.matchScreenshot();
    await page.locator('.dcc-view .more-btn').click();
    await page.getByPlaceholder('Search for currency or code').type('gb');
    await util.matchScreenshot();
    await page.getByText('British Pound').click();
    await util.matchScreenshot();
  });
  test('Should make payment in USD', async ({ util, page }) => {
    const options = Options({});

    await util.openCheckout({
      options,
    });
    await page.waitForTimeout(1000);
    await util.fillContactDetails();
    await util.clickCTA();
    await util.openMethodFromL0('card');
    const isOTPForm = await page.locator('#form-otp').isVisible();
    if (isOTPForm) {
      await page.getByText('Skip Saved Cards').click();
    }

    await util.enterCardDetails({ cardNumber: '4242424242424242' });
    await util.clickCTA();
    await page.getByText('Pay without Saving Card').click();
    await page.locator('#otp').type('5555');
    await util.clickCTA();
  });
});
