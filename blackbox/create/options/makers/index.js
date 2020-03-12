const netbanking = require('./netbanking');
const upiQr = require('./upi-qr');
const emandate = require('./emandate');
const bankTransfer = require('./bank-transfer');
const cards = require('./cards');
const emi = require('./emi');

module.exports = {
  netbanking: netbanking,
  'upi-qr': upiQr,
  emandate: emandate,
  'bank-transfer': bankTransfer,
  cards: cards,
  emi: emi,
};
