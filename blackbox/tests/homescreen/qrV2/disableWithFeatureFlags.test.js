const createUpiQrV2Test = require('../../../create/upi-qr-v2');

createUpiQrV2Test({
  pspDowntimeCallout: true,
  apiErrorCase: true,
  homeScreenQr: true,
  upiScreenQr: true,
  disable_homescreen_qr: true,
  disable_upiscreen_qr: true,
});
createUpiQrV2Test({
  pspDowntimeCallout: true,
  apiErrorCase: true,
  homeScreenQr: true,
  disable_homescreen_qr: true,
});
createUpiQrV2Test({
  pspDowntimeCallout: true,
  apiErrorCase: true,
  upiScreenQr: true,
  disable_upiscreen_qr: true,
});
