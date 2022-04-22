const createAccountTabTest = require('../../../create/one-click-checkout/account-tab');

// login, then open account tab and logout from all devices
createAccountTabTest({
  amount: 200 * 100,
  logoutAll: true,
  loggedIn: true,
  anon: false,
});
