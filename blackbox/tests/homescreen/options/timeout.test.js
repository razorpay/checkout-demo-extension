const createUPICollectTest = require('../../../create/upi-collect');
const createCardTest = require('../../../create/cards');
const testRunner = require('../../../create/checkout-test-runner');

const testOverrides = { timeout: true };

testRunner
  .setTestFeatures([])
  .runOn(createUPICollectTest, testOverrides)
  .runOn(createCardTest, testOverrides);
