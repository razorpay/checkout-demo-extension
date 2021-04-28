const createCardsTest = require('../../../create/cards');
/**
 * To test in case of remember_customer option is passed by merchant
 * but preference api gives optionalContact & user didn't enter contact
 * then don't show remmeber me card option
 */
createCardsTest({
  optionalContact: true,
  remember_customer: true,
});
