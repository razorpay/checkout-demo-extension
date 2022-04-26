const createNavigationTest = require('../../../create/one-click-checkout/navigation');

// verify correct tabs are opened when navigating through the screens ( summary / address / payments )
createNavigationTest({
  amount: 200 * 100,
  loggedIn: true,
  anon: false,
});
