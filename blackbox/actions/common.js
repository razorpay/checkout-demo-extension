const { readFileSync } = require('fs');
const { delay, innerText } = require('../util');
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
const qrActions = require('./qr-actions');
const emandateBanktransferActions = require('./emandate-banktransfer-actions');
const paylaterActions = require('./paylater-actions');
const personalizationActions = require('./personalization-actions');
const payoutActions = require('./payout-actions');

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
  ...qrActions,
  ...emandateBanktransferActions,
  ...paylaterActions,
  ...personalizationActions,
  ...payoutActions,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  verifyDiscountAmountInBanner,
  passRequestNetbanking,
  passRequestWallet,
  verifyAutoSelectBankTPV,
  retryPayzappWalletTransaction,
  goBackFromTopbar,
  verifyAmountInHeader,
  getAmountFromHeader,
};

async function verifyAutoSelectBankTPV(context, bank) {
  const autoSelectbank = await context.page.waitForSelector('.bank-name');
  const autoSelectbankName = await context.page.evaluate(
    autoSelectbank => autoSelectbank.textContent,
    autoSelectbank
  );
  expect(autoSelectbankName).toContain(bank);
  const accountDiv = await context.page.waitForSelector('.account-details');
  const accountNumber = await context.page.evaluate(
    accountDiv => accountDiv.textContent,
    accountDiv
  );
  expect(accountNumber).toContain(context.preferences.order.account_number);
  expect(autoSelectbankName).toContain(bank);
}

async function retryPayzappWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#fd-hide');
  await retryButton.click();
}

async function passRequestNetbanking(context) {
  const successResult = { razorpay_payment_id: 'pay_DaFKujjV6Ajr7W' };
  const req = await context.expectRequest();
  //expect(req.url).toContain('status?key_id');
  context.respondJSON({
    type: 'first',
    request: {
      url:
        'https://api-web.func.razorpay.in/v1/gateway/mocksharp/payment?key_id=rzp_test_csiPFCSLbrdDCO',
      method: 'post',
      content: {
        action: 'authorize',
        amount: 105,
        method: 'netbanking',
        payment_id: 'DewgcLMrzDlVRg',
        callback_url:
          'https://api-web.func.razorpay.in/v1/payments/pay_DewgcLMrzDlVRg/callback/c736f6c7af6f597606344637cbe802c7ebac24ca/rzp_test_csiPFCSLbrdDCO',
        recurring: 0,
      },
    },
    version: 1,
    payment_id: 'pay_DewgcLMrzDlVRg',
    gateway:
      'eyJpdiI6IjJLaG5PSnF0NUV6TVJRdkRnajc1UFE9PSIsInZhbHVlIjoiczdQZEUrMGN2NFFneTJkQmJuUFwvb3hsUmpxdG1NNTUzaXpRaytpN0J2RDQ9IiwibWFjIjoiMzAzMTU2MmQwNzA0OWU1NjQ2OGI3MjNkOGQyNDAxZTM1MzA0YmFkZDQwNWFlODAyYTg1OGNiZTIwODgwYmI5ZSJ9',
    amount: '\u20b9 1.05',
    image: null,
    magic: false,
  });
  await delay(500);
}

async function passRequestWallet(context) {
  context.respondJSON({
    type: 'first',
    request: {
      url:
        'https://api-web.func.razorpay.in/v1/gateway/mocksharp/payment?key_id=rzp_test_csiPFCSLbrdDCO',
      method: 'post',
      content: {
        action: 'authorize',
        amount: 105,
        method: 'wallet',
        payment_id: 'DewgcLMrzDlVRg',
        callback_url:
          'https://api-web.func.razorpay.in/v1/payments/pay_DewgcLMrzDlVRg/callback/c736f6c7af6f597606344637cbe802c7ebac24ca/rzp_test_csiPFCSLbrdDCO',
        recurring: 0,
      },
    },
    version: 1,
    payment_id: 'pay_DewgcLMrzDlVRg',
    gateway:
      'eyJpdiI6IjJLaG5PSnF0NUV6TVJRdkRnajc1UFE9PSIsInZhbHVlIjoiczdQZEUrMGN2NFFneTJkQmJuUFwvb3hsUmpxdG1NNTUzaXpRaytpN0J2RDQ9IiwibWFjIjoiMzAzMTU2MmQwNzA0OWU1NjQ2OGI3MjNkOGQyNDAxZTM1MzA0YmFkZDQwNWFlODAyYTg1OGNiZTIwODgwYmI5ZSJ9',
    amount: '\u20b9 1.05',
    image: null,
    magic: false,
  });
}

async function verifyDiscountAmountInBanner(context, expectedDiscountAmount) {
  const discount = await context.page.waitForSelector('#amount > .discount');
  let discountAmount = await context.page.evaluate(
    discount => discount.textContent,
    discount
  );
  expect(discountAmount).toEqual(expectedDiscountAmount);
}

async function verifyDiscountPaybleAmount(context, expectedDiscountAmount) {
  const footer = await context.page.waitForSelector('#footer');
  let footerText = await context.page.evaluate(
    footer => footer.textContent,
    footer
  );

  footerText = footerText.trim();

  const footerEndsWithDiscountAmount = footerText.endsWith(
    expectedDiscountAmount
  );

  expect(footerEndsWithDiscountAmount).toEqual(true);
}

async function verifyDiscountText(context, expectedDiscountAmount) {
  const discount = await context.page.$eval(
    '.offers-container small',
    el => el.innerText
  );
  expect(discount).toEqual(expectedDiscountAmount);
}

async function goBackFromTopbar(context) {
  await context.page.click('#tab-title');
}

async function verifyAmountInHeader(amount) {
  expect(await getAmountFromHeader()).toEqual(amount);
}

async function getAmountFromHeader() {
  const amountInHeader = (await innerText('#amount')).trim();
  return amountInHeader;
}
