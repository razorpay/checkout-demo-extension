const { openCheckout } = require('../../actions');

async function openCheckoutWithNewHomeScreen(props) {
  props.experiments = {
    home_2019: 1,
  };

  return await openCheckout(props);
}

module.exports = {
  openCheckoutWithNewHomeScreen,
};
