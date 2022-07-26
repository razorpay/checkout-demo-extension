const createUpiQrV2Test = require('../../../../create/upi-qr-v2');
/**
 * With a new change ot
 * SHOW QR (Remove auto generate QR), QR will not be generated until unless user opts
 * and every cancel reason is intended only
 * P.S REFRESH QR and SHOW QR are same component but different Text Content
 * Note: This test is DISABLED by renaming `unintendedOptOut.test.js`=>`unintendedOptOut.js`
 */
createUpiQrV2Test({
  unintendedOptOut: true,
  upiScreenQr: true,
});
