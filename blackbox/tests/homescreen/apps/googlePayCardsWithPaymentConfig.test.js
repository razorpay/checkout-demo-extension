const createAppsTest = require('../../../create/apps');

createAppsTest({
  app: 'google_pay_cards',
  testName: 'Google Pay Cards - with Payment Config',
  config: {
    display: {
      blocks: {
        custom: {
          name: 'Pay with Apps',
          instruments: [
            {
              method: 'app',
              providers: ['google_pay_cards'],
            },
          ],
        },
      },
      sequence: ['block.custom'],
    },
  },
});
