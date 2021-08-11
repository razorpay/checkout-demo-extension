const createAppsTest = require('../../../create/app');

createAppsTest({
  app: 'google_pay',
  platform: 'android',
  testName: 'Google Pay Cards - with Payment Config',
  config: {
    display: {
      blocks: {
        custom: {
          name: 'Pay with Apps',
          instruments: [
            {
              method: 'app',
              providers: ['google_pay'],
            },
          ],
        },
      },
      sequence: ['block.custom'],
    },
  },
});
