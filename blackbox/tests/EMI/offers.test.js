const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { getTestData } = require('../../actions');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  viewOffers,
  enterCardDetails,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
  submit,
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,
  handleMockSuccessDialog,
  handleEMIValidation,
} = require('../../actions/common');

describe.each(
  getTestData('perform EMI transaction with No cost EMI offers applied', {
    options: {
      amount: 500000,
    },
    preferences: {
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
    },
  })
)('EMI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    await setPreferenceForOffer(preferences);
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'emi');
    await enterCardDetails(context);
    await viewOffers(context);
    await selectOffer(context, '6');
    await verifyOfferApplied(context);
    await submit(context);
    await verifyEMIPlansWithOffers(context, '2');
    await selectEMIPlanWithOffer(context, '2');
    await submit(context);
    await handleEMIValidation(context);
    await handleMockSuccessDialog(context);
  });
});
