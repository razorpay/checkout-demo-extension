const createCardlessEMITest = require('../../../../create/cardless-emi');

createCardlessEMITest({
  partialPayment: true,
  optionalContact: true,
  popupZestMoney: true,
});
