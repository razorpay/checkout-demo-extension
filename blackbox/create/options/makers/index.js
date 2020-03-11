const netbanking = require('./netbanking');
const upiQr = require('./upi-qr');
const bankTransfer = require('./bank-transfer');

module.exports = {
  netbanking: netbanking,
  'upi-qr': upiQr,
  'bank-transfer': bankTransfer,
};
