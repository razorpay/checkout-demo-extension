const createUpiQrV2Test = require('../../../../create/upi-qr-v2');

createUpiQrV2Test({
  top3AppsDown: true,
  feeBearerCheckout: true, // fee-bearer should not load the QR so other options doesn't have significance
  timeOut: 15 * 60,
  pspDowntimeCallout: true,
  apiErrorCase: true,
  homeScreenQr: true,
});
