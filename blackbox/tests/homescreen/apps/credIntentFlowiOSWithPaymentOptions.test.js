const createAppsTest = require('../../../create/app');

createAppsTest({
  app: 'cred',
  flow: 'intent',
  platform: 'ios',
  testName: 'CRED - Intent Flow - iOS - with Payment Config',
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
