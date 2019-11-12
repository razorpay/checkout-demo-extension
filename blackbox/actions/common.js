const { readFileSync } = require('fs');
const emiActions = require('./emi-actions');
const homepageActions = require('./home-page-actions');
const netBankingActions = require('./netbanking-actions');
const partialPaymentActions = require('./partial-payment-actions');
const otpActions = require('./otp-actions');
const feebearerActions = require('./feebearer-actions');
const upiActions = require('./upi-actions');
const offerActions = require('./offers-actions');
const cardActions = require('./card-actions');
const downtimeTimoutActions = require('./downtime-timeout-actions');
const walletActions = require('./wallet-actions');
const sharedActions = require('./shared-actions');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

module.exports = {
  ...offerActions,
  ...otpActions,
  ...emiActions,
  ...homepageActions,
  ...upiActions,
  ...cardActions,
  ...netBankingActions,
  ...partialPaymentActions,
  ...feebearerActions,
  ...downtimeTimoutActions,
  ...walletActions,
  ...sharedActions,
};
