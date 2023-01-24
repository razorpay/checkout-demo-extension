import { test } from '../../core';
import testCases from './testData.international';

/**
 * Scope of this test to check if email field is visible or not in case of international flow
 * * saved international card from p13n or saved card screen
 */

test.describe.configure({ mode: 'parallel' });
test.describe('Email Less Checkout Feature - International Flow', () => {
  for (const testCase of testCases) {
    test(testCase.title, async ({ page, util }) => {
      util.updateContext({
        apiOverrides: testCase.overrides || {},
      });
      await util.openCheckout({
        options: util.prepareOptions(testCase.options),
      });
      await page.waitForTimeout(1000);
      const preference = util.getContext().apiResponse?.preferences;
      // skip contact screen assertion
      if (!preference?.customer) {
        await util.assertContactDetailPage();
        await util.fillContactDetails();
        // Contact screen assertion
        await util.matchScreenshot();
        await util.clickCTA();
      }
      // L0 assertion
      await util.matchScreenshot();

      const tokens = preference?.customer?.tokens;

      if (testCase.p13n) {
        // select card from p13n
        await util.selectSavedCard({
          last4: tokens?.items?.[0]?.card?.last4,
          fill: {
            cvv: '123',
          },
          screen: 'L0',
        });
        // validate email field exist
        await util.matchScreenshot();

        // try to submit
        await util.clickCTA();
        // should not able to proceed
        await util.matchScreenshot();
        return;
      }
      // open card
      await util.openMethodFromL0('card');
      if (tokens?.count > 0) {
        // select card
        await util.selectSavedCard({
          last4: tokens?.items?.[0]?.card?.last4,
          fill: {
            cvv: '123',
          },
        });
        // screenshot email field should be there
        await util.matchScreenshot();

        // try to submit
        await util.clickCTA();
        // should not able to proceed
        await util.matchScreenshot();
      } else {
        // fill card details
        await util.enterCardDetails({ cardNumber: '4242424242424242' });
        // email field should be there
        await util.matchScreenshot();
      }
      await page.close();
    });
  }
});
