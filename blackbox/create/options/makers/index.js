const netbanking = require('./netbanking');
const upiQr = require('./upi-qr');
const emandate = require('./emandate');
const bankTransfer = require('./bank-transfer');
const savedCards = require('./saved-cards');
const cards = require('./cards');
const emi = require('./emi');
const tpv = require('./tpv');
const wallet = require('./wallet');
const zestMoney = require('./zest-money');
const omniChannel = require('./omni-channel');
const payLater = require('./pay-later');

module.exports = {
  netbanking: netbanking,
  'upi-qr': upiQr,
  emandate: emandate,
  'bank-transfer': bankTransfer,
  'saved-cards': savedCards,
  cards: cards,
  emi: emi,
  tpv: tpv,
  wallet: wallet,
  'zest-money': zestMoney,
  'omni-channel': omniChannel,
  'pay-later': payLater,
};
