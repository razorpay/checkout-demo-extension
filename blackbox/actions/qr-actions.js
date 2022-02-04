const { visible } = require('../util');
var querystring = require('querystring');

async function validateQRImage(context) {
  await context.page.waitForSelector('[alt=QR]');
  const currentElement = await context.page.$eval('[alt=QR]', visible);
  expect(currentElement).toEqual(true);
}

async function responseWithQRImage(context) {
  const req = await context.expectRequest();
  const encyptedURL = querystring.unescape(req.url);
  const url =
    'upi://pay?pa=upi@razopay&pn=Razorpay&tr=1UIWQ1mLDGYBQbR&tn=razorpay&am=10.24&cu=INR&mc=5411';
  expect(encyptedURL).toContain(url);
  await context.respondImage();
}

module.exports = {
  validateQRImage,
  responseWithQRImage,
};
