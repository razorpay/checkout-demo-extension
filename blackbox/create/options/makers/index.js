const netbanking = require('./netbanking');
const upiQr = require('./upi-qr');
const emandate = require('./emandate');
const bankTransfer = require('./bank-transfer');
const savedCards = require('./saved-cards');
const cards = require('./cards');
const emi = require('./emi');
const wallet = require('./wallet');

module.exports = {
  netbanking: netbanking,
  'upi-qr': upiQr,
  emandate: emandate,
  'bank-transfer': bankTransfer,
  'saved-cards': savedCards,
  cards: cards,
  emi: emi,
  wallet: wallet,
};
