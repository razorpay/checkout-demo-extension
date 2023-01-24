const createOfferTest = require('../../../create/one-click-checkout/offers');

createOfferTest({
  couponValid: true,
  discountAmount: 10 * 100,
  couponCode: 'WELCOME10',
  offers: true,
  amount: 200 * 100,
  showCoupons: true,
  serviceable: true,
  saveAddress: true,
});

/**
 * Flow with the offers fix
 * TODO: remove the {enableFixExp} flag once the experiment if 100%
 */
createOfferTest({
  couponValid: true,
  discountAmount: 10 * 100,
  couponCode: 'WELCOME10',
  offers: true,
  amount: 200 * 100,
  showCoupons: true,
  serviceable: true,
  saveAddress: true,
  enableFixExp: true,
});
