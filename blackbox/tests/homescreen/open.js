const { openCheckout } = require('../../actions');
const { openSdkCheckout } = require('../../actions/checkout-sdk');

async function openCheckoutWithNewHomeScreen(props) {
  return await openCheckout(props);
}

async function openSdkCheckoutWithNewHomeScreen(props) {
  return await openSdkCheckout(props);
}

module.exports = {
  openCheckoutWithNewHomeScreen,
  openSdkCheckoutWithNewHomeScreen,
};
