const netbanking = require('./netbanking');
const upiQr = require('./upi-qr');
const emandate = require('./emandate');
const bankTransfer = require('./bank-transfer');
const savedCards = require('./saved-cards');
const cards = require('./cards');
const emi = require('./emi');
const tpv = require('./tpv');
const wallet = require('./wallet');
const cardlessEmi = require('./cardless-emi');
const upiIntent = require('./upi-intent');
const upiWebPayments = require('./upi-web-payments');
const omniChannel = require('./omni-channel');
const payLater = require('./pay-later');
const savedVPA = require('./saved-vpa');
const upiCollect = require('./upi-collect');
const upiOtm = require('./upi-otm');
const payouts = require('./payouts.js');
const app = require('./app.js');
const internationalPaypal = require('./international/paypal.js');
const oneClickCheckout = require('./one-click-checkout');
const internationalTrustly = require('./international/trustly');

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
  'cardless-emi': cardlessEmi,
  'upi-intent': upiIntent,
  'upi-web-payments': upiWebPayments,
  'omni-channel': omniChannel,
  'pay-later': payLater,
  'saved-vpa': savedVPA,
  'upi-collect': upiCollect,
  payouts: payouts,
  'upi-otm': upiOtm,
  app: app,
  'international-paypal': internationalPaypal,
  'one-click-checkout': oneClickCheckout,
  'international-trustly': internationalTrustly,
};
