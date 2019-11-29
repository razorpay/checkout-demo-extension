const { openCheckout } = require('../../actions');
const { openSdkCheckout } = require('../../actions/checkout-sdk');

async function openCheckoutWithNewHomeScreen(props) {
  props.experiments = {
    home_2019: 1,
  };

  return await openCheckout(props);
}

async function openSdkCheckoutWithNewHomeScreen(props) {
  props.experiments = {
    home_2019: 1,
  };

  return await openSdkCheckout(props);
}

module.exports = {
  openCheckoutWithNewHomeScreen,
  openSdkCheckoutWithNewHomeScreen,
};
