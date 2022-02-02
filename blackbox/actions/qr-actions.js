const { visible } = require('../util');
var querystring = require('querystring');
const { delay } = require('../../mock-api/utils');

async function validateQRImage(context) {
  await context.page.waitForSelector('[alt=QR]');
  const currentElement = await context.page.$eval('[alt=QR]', visible);
  expect(currentElement).toEqual(true);
}

async function responseWithQRImage(context, newFlow) {
  const req = await context.expectRequest();
  const encyptedURL = querystring.unescape(req.url);
  let url;

  if (newFlow) {
    url =
      'upi://pay?ver=01&mode=15&pa=rpy.qrrazorpay2102110597@icici&pn=Razorpay&tr=RZPIjCMsV6qTpgStBqrv2&tn=PaymenttoRazorpay&cu=INR&mc=8931&qrMedium=04&am=1';
  } else {
    url =
      'upi://pay?pa=upi@razopay&pn=Razorpay&tr=1UIWQ1mLDGYBQbR&tn=razorpay&am=10.24&cu=INR&mc=5411';
  }

  expect(encyptedURL).toContain(url);
  await context.respondImage();
}
function shouldShowNewQRFlow(features, options) {
  const {
    partialPayments,
    feeBearer,
    offers,
    personalization,
    dynamicFeeBearer,
  } = features;
  const anyFeeBearer = feeBearer || dynamicFeeBearer;

  if (
    anyFeeBearer ||
    partialPayments ||
    personalization ||
    offers ||
    options['invoice_id'] ||
    options['account_id'] ||
    options['timeout'] ||
    (!options['key'] && !preferences['merchant_key'])
  ) {
    return false;
  }
  return true;
}
module.exports = {
  validateQRImage,
  responseWithQRImage,
  shouldShowNewQRFlow,
};
