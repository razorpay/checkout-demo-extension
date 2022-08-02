const createCardsTest = require('../../../create/cards');

const AVS_PREFILL_DATA = {
  'billing_address[line1]': '21A Vincent Square',
  'billing_address[line2]': '',
  'billing_address[postal_code]': 'SW1P 2NA',
  'billing_address[city]': 'London',
  'billing_address[country]': 'GB',
  'billing_address[state]': 'England',
};

/**
 * Test AVS without DCC enabled with internation card
 * Expected: AVS screen should be shown
 */
createCardsTest({
  avs: true,
  AVSPrefillData: AVS_PREFILL_DATA,
  internationalCard: true,
});
