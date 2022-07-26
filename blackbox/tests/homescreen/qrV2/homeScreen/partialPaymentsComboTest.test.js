const createUpiQrV2Test = require('../../../../create/upi-qr-v2');

createUpiQrV2Test({
  partialPayment: true,
  persistent: true,
  intendedOptOut: true,
  timeOut: 10 * 60,
  pspDowntimeCallout: true,
  apiErrorCase: true,
  homeScreenQr: true,
});
