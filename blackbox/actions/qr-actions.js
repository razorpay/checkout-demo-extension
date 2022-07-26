const { visible } = require('../util');
var querystring = require('querystring');

async function validateQRImage(context) {
  await context.page.waitForSelector('[alt=QR]');
  const currentElement = await context.page.$eval('[alt=QR]', visible);
  expect(currentElement).toEqual(true);
}

async function responseWithQRImage(context) {
  /**
   * From UPI QR V2 Feature onwards, as we are having QRV2 on both Home-Screen and UPI Screen
   * we are ignoring QR image fetch call (/charts.google.com/i) at interceptor level
   * Hence there is no need to catch and or or respond to such calls.
   */
  // const req = await context.expectRequest();
  // const encyptedURL = querystring.unescape(req.url);
  // const url =
  //   'upi://pay?pa=upi@razopay&pn=Razorpay&tr=1UIWQ1mLDGYBQbR&tn=razorpay&am=10.24&cu=INR&mc=5411';
  // expect(encyptedURL).toContain(url);
  // await context.respondImage();
}

module.exports = {
  validateQRImage,
  responseWithQRImage,
};
