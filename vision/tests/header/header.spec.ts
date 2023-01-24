import { test, expect } from '../../core';
import testCases from './header.testCases';

function emailLessPreference(
  pref,
  testCase: {
    fee?: boolean;
    offers?: boolean;
    forcedOffer?: boolean;
    tpv?: boolean;
    partialPayment?: boolean;
  }
) {
  const { fee, offers, forcedOffer, tpv, partialPayment } = testCase;
  const partialPaymentOrder = {
    partial_payment: true,
    amount: 100000,
    currency: 'INR',
    amount_paid: 6100,
    amount_due: 93900,
    first_payment_min_amount: 100,
  };
  const TPVOrder = {
    partial_payment: false,
    amount: 20000,
    currency: 'INR',
    amount_paid: 0,
    amount_due: 20000,
    first_payment_min_amount: null,
    bank: 'HDFC',
    account_number: 'XXXXX22',
    method: 'netbanking',
  };
  return {
    ...pref,
    fee_bearer: fee,
    offers:
      forcedOffer || offers
        ? [
            {
              id: 'offer_GRCNWv6gZeAYqq',
              name: 'Card Offer ',
              payment_method: 'card',
              display_text: 'Card Offer 10% Off',
              type: 'instant',
              original_amount: 500000,
              amount: 499000,
            },
            {
              id: 'offer_GRCOmRy2re98Ip',
              name: 'Netbanking Offer',
              payment_method: 'netbanking',
              display_text: 'Netbanking Offer 10% Off',
              type: 'instant',
              original_amount: 500000,
              amount: 499000,
            },
          ]
        : [],
    force_offer: forcedOffer,
    ...(tpv || partialPayment
      ? {
          order: tpv ? TPVOrder : partialPaymentOrder,
        }
      : {}),
  };
}

test.describe('Header Redesign Test suite', () => {
  for (const testCase of testCases) {
    test(testCase.title, async ({ page, util }) => {
      util.updateContext({
        apiOverrides: {
          preferences: (pref) => emailLessPreference(pref, testCase),
        },
      });
      await util.openCheckout({
        options: util.prepareOptions(testCase.options || {}),
      });
      await page.waitForTimeout(1500);
      expect(await page.screenshot()).toMatchSnapshot();
    });
  }
});
