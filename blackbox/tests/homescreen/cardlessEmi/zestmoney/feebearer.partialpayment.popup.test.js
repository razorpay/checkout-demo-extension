const createCardlessEMITest = require('../../../../create/cardless-emi');

createCardlessEMITest({
  partialPayment: true,
  feeBearer: true,
  popupZestMoney: true,
});
