const createMerchantPolicyTest = require('../../../create/one-click-checkout/merchant-policy');

createMerchantPolicyTest({
  hasMerchantPolicy: true,
  loggedIn: true,
  amount: 200 * 100,
  anon: false,
});
