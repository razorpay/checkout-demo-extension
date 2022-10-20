const createCouponsTest = require('../../../create/one-click-checkout/coupons');

createCouponsTest({
  amount: 200 * 100,
  couponsDisabled: true,
  serviceable: true,
  saveAddress: false,
});
