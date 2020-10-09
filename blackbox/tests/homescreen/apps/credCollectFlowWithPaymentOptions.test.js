const createAppsTest = require('../../../create/app');

createAppsTest({
  app: 'cred',
  flow: 'collect',
  platform: 'android',
  testName: 'CRED - Collect Flow - with Payment Config',
  config: {
    display: {
      blocks: {
        custom: {
          name: 'Pay with Apps',
          instruments: [
            {
              method: 'app',
              providers: ['cred'],
            },
          ],
        },
      },
      sequence: ['block.custom'],
    },
  },
});
