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
const upiIntent = require('./upi-intent');
const omniChannel = require('./omni-channel');
const payLater = require('./pay-later');
const savedVPA = require('./saved-vpa');
const upiCollect = require('./upi-collect');
const upiOtm = require('./upi-otm');
const payouts = require('./payouts.js');
const internationalPaypal = require('./international/paypal.js');

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
  'upi-intent': upiIntent,
  'omni-channel': omniChannel,
  'pay-later': payLater,
  'saved-vpa': savedVPA,
  'upi-collect': upiCollect,
  payouts: payouts,
  'upi-otm': upiOtm,
  'international-paypal': internationalPaypal,
};
