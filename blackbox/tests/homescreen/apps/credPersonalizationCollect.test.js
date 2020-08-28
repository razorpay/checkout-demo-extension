const createAppsTest = require('../../../create/app');

createAppsTest({
  app: 'cred',
  flow: 'collect',
  platform: 'android',
  testName: 'CRED - Collect Flow - with Personalization',
  personalization: true,
});
