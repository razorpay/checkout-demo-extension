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
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
};

async function verifyDiscountAmountInBanner(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('#amount > .discount');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}

async function verifyDiscountPaybleAmount(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('.pay-btn .discount');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}

async function verifyDiscountText(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('.discount-text');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}