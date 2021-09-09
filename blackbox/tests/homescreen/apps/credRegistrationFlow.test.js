const createAppsTest = require('../../../create/app');

createAppsTest({
  app: 'cred',
  flow: 'newUser',
  emulate: 'Nexus 10',
  platform: 'web',
  testName: 'CRED - New User Flow',
});
