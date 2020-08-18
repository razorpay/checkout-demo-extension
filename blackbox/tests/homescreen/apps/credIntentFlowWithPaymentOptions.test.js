const createAppsTest = require('../../../create/apps');

createAppsTest({
  app: 'cred',
  flow: 'intent',
  platform: 'android',
  testName: 'CRED - Intent Flow - Android - with Payment Config',
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
