const createCardsTest = require('../../../create/cards');

const AVS_PREFILL_DATA = {
  'billing_address[line1]': '21A Vincent Square',
  'billing_address[line2]': '',
  'billing_address[postal_code]': 'SW1P 2NA',
  'billing_address[city]': 'London',
  'billing_address[country]': 'GB',
  'billing_address[state]': 'Greater London',
};

createCardsTest({
  dcc: true,
  avs: true,
  AVSPrefillData: AVS_PREFILL_DATA,
  withSiftJS: false,
});
