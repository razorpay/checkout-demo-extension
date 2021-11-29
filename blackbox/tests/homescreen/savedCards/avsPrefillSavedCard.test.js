const createSavedCardsTest = require('../../../create/saved-cards');

/**
 * Test AVS on international saved cards if DCC is disabled
 * i.e card with non Indian currency
 * Expected: AVS screen should be shown with prefilled data
 */
createSavedCardsTest({
  avs: true,
  avsPrefillFromSavedCard: true,
});
