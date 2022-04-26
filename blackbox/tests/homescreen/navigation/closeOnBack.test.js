const createNavigationTest = require('../../../create/one-click-checkout/navigation');

// close 1cc modal by clicking back icon on L0 screen
createNavigationTest({
  amount: 200 * 100,
  closeModalOnBack: true,
});
