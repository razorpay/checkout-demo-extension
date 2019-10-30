const { openCheckout } = require('../../checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  viewOffers,
  enterCardDetails,
  selectOffer,
  verifyOfferApplied,
} = require('../../actions/common');

describe('Card tests', () => {
  test('perform card transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 500000,
      personalization: false,
    };
    const preferences = makePreferences({
      offers: [
        {
          id: 'offer_DWcU6U9B3jV8Aa',
          name: 'No Cost EMI - HDFC',
          payment_method: 'emi',
          issuer: 'HDFC',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcYItBeDeYSr3',
          name: 'No Cost EMI - Standard Chartered',
          payment_method: 'emi',
          issuer: 'SCBL',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcZK1ZHr9nCW0',
          name: 'No Cost EMI - AXIS',
          payment_method: 'emi',
          issuer: 'UTIB',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcahvl33wimnY',
          name: 'No Cost EMI - Indusind',
          payment_method: 'emi',
          issuer: 'INDB',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcbYlDBNz2Zyt',
          name: 'No Cost EMI - RBL',
          payment_method: 'emi',
          issuer: 'RATN',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcdgbZjWPlmou',
          name: 'No Cost EMI - ICICI',
          payment_method: 'emi',
          issuer: 'ICIC',
          emi_subvention: true,
        },
        {
          id: 'offer_DWceNzkjugg37y',
          name: 'No Cost EMI - Yes Bank',
          payment_method: 'emi',
          issuer: 'YESB',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcfDUXq0X08U6',
          name: 'No Cost EMI - Kotak ',
          payment_method: 'emi',
          issuer: 'KKBK',
          emi_subvention: true,
        },
        {
          id: 'offer_DWcgB9L2MBVGwZ',
          name: 'No Cost EMI - SBI Bank',
          payment_method: 'emi',
          issuer: 'SBIN',
          emi_subvention: true,
        },
        {
          id: 'offer_DWchUIIT6QYX76',
          name: 'No Cost EMI - AMEX',
          payment_method: 'emi',
          payment_network: 'AMEX',
          emi_subvention: true,
        },
      ],
    });

    preferences.methods.emi_options.ICIC[0].subvention = 'merchant';
    preferences.methods.emi_options.ICIC[1].subvention = 'merchant';

    preferences.methods.emi_options.ICIC[0].offer_id = 'offer_DWcdgbZjWPlmou';
    preferences.methods.emi_options.ICIC[1].offer_id = 'offer_DWcdgbZjWPlmou';

    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await viewOffers(context);
    await selectOffer(context, '6');
    await verifyOfferApplied(context);
  });
});
