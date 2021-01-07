const createUPICollectTest = require('../../../create/upi-collect');
const createCardTest = require('../../../create/cards');
const testRunner = require('../../../create/checkout-test-runner');

testRunner
  .setTestFeatures([])
  .runOn(testFeatures =>
    createUPICollectTest(Object.assign({}, testFeatures, { timeout: true }))
  )
  .runOn(testFeatures =>
    createCardTest(Object.assign({}, testFeatures, { timeout: true }))
  );
