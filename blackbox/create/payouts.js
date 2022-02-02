const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckout } = require('../actions');
const {} = require('../tests/homescreen/actions');

const {
  verifyPayoutInstruments,
  enterBankAccountDetails,
  addInstrument,
  submit,
  respondToFundAccountsRequest,
  selectInstrument,
  handleUPIAccountValidation,
  enterUPIAccount,
  shouldShowNewQRFlow,
} = require('../actions/common');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'payouts',
    testFeatures
  );

  const {
    existingBankInstrument,
    existingVPAInstrument,
    bankWithExistingInstrument,
    bankWithoutExistingInstrument,
    VPAWithExistingInstrument,
    VPAWithoutExistingInstrument,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('Payout tests', ({ preferences, title, options }) => {
    test(title, async () => {
      if (VPAWithExistingInstrument || VPAWithoutExistingInstrument) {
        preferences.methods.upi = true;
      }
      const context = await openCheckout({ page, options, preferences });
      if (!bankWithoutExistingInstrument && !VPAWithoutExistingInstrument) {
        await verifyPayoutInstruments(context);
      }
      if (bankWithExistingInstrument || bankWithoutExistingInstrument) {
        await addInstrument(context, 'Bank');
        await enterBankAccountDetails(context);
      }
      if (existingBankInstrument) {
        await selectInstrument(context, 2);
      }
      if (existingVPAInstrument) {
        await selectInstrument(context, 1);
      }
      if (VPAWithExistingInstrument || VPAWithoutExistingInstrument) {
        await addInstrument(context, 'VPA');

        if (shouldShowNewQRFlow(features, options)) {
          const vpaField = await context.page.waitForSelector(
            '#new-vpa-field-upi'
          );
          vpaField.click();
        }

        await enterUPIAccount(context, 'BHIM@upi');
      }
      await submit(context);
      if (bankWithExistingInstrument || bankWithoutExistingInstrument) {
        await respondToFundAccountsRequest(context, 'Bank');
      }
      if (VPAWithExistingInstrument || VPAWithoutExistingInstrument) {
        await handleUPIAccountValidation(context, 'BHIM@upi');
        await respondToFundAccountsRequest(context, 'BHIM');
      }
    });
  });
};
