const { openCheckout } = require('../../actions');
const { openSdkCheckout } = require('../../actions/checkout-sdk');

async function openCheckoutWithNewHomeScreen(props) {
  return await openCheckout(props);
}

async function openSdkCheckoutWithNewHomeScreen(props) {
  return await openSdkCheckout(props);
}

async function openCheckoutOnMobileWithNewHomeScreen(props) {
  props = { ...props, emulate: props.emulate || 'Pixel 2' };
  return await openCheckout(props);
}
module.exports = {
  openCheckoutWithNewHomeScreen,
  openSdkCheckoutWithNewHomeScreen,
  openCheckoutOnMobileWithNewHomeScreen,
};
