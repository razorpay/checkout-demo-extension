const createSavedCardsTest = require('../../../create/saved-cards');

/**
 * Test AVS on domestic saved cards if DCC is disabled
 * i.e card with Indian currency
 * Expected: AVS screen should not be shown
 */
createSavedCardsTest({
  avs: true,
  domesticSavedCard: true,
});
