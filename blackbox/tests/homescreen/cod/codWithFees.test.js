const createCODTest = require('../../../create/one-click-checkout/cod');
const testRunner = require('../../../create/cod-test-runner');

testRunner.setTestFeatures(testRunner.globalFeatureList).runOn(createCODTest, {
  saveAddress: true,
  amount: 20000,
  discountAmount: 100 * 100,
});
