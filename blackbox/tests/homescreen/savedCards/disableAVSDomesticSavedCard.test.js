const createSavedCardsTest = require('../../../create/saved-cards');

/**
 * Test domestic saved card flow if AVS is not enabled
 * Expected: AVS screen should not be shown
 */
createSavedCardsTest({
  avs: false,
  domesticSavedCard: true,
});
