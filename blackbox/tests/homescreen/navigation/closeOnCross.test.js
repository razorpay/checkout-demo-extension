const createNavigationTest = require('../../../create/one-click-checkout/navigation');

// close 1cc modal by clicking cross icon
createNavigationTest({
  amount: 200 * 100,
  closeModalOnCross: true,
  skip: true,
});
