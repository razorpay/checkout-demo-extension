const createAccountTabTest = require('../../../create/one-click-checkout/account-tab');

// login, then open account tab and logout
createAccountTabTest({
  amount: 200 * 100,
  logout: true,
  loggedIn: true,
  anon: false,
});
