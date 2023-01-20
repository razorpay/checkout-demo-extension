import { test } from '../../core';
import Options from '../../mock/options';
import testCases from './testData';

function emailLessPreference(
  pref,
  testCase: { prefs: boolean[]; fee?: boolean }
) {
  const [showEmail = false, optionalEmail = false] = testCase.prefs;

  return {
    ...pref,
    fee_bearer: testCase.fee,
    features: {
      ...pref.features,
      show_email_on_checkout: showEmail,
      email_optional_oncheckout: optionalEmail,
    },
  };
}

test.describe.configure({ mode: 'parallel' });
test.describe('Email Less Checkout Feature', () => {
  for (const testCase of testCases) {
    test(testCase.title, async ({ page, util }) => {
      const options = Options(testCase.options);
      util.updateContext({
        apiOverrides: {
          preferences: (pref) => emailLessPreference(pref, testCase),
        },
      });
      await util.openCheckout({
        options,
      });
      await page.waitForTimeout(1000);
      await util.assertContactDetailPage();
      await util.fillContactDetails(testCase?.fillContact);
      // Contact screen assertion
      await util.matchScreenshot();
      await util.clickCTA();
      await page.waitForTimeout(1000);
      // L0 assertion
      await util.matchScreenshot();
      // open netbanking
      await util.openMethodFromL0('netbanking');
      await util.selectBankFromGrid('SBIN');
      const { popup, handleResponse } = await util.getPopup(async () => {
        await util.clickCTA();
        if (testCase.fee) {
          await util.handleFeeBearerDialog();
        }
      });
      await popup.waitForTimeout(1000);
      await handleResponse(testCase.handler);
      // post payment success message
      await page.waitForTimeout(2500);
      await util.matchScreenshot();
    });
  }
});
