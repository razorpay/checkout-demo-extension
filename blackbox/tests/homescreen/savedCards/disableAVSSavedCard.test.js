const createSavedCardsTest = require('../../../create/saved-cards');

/**
 * Test international saved card flow if AVS is not enabled
 * Expected: AVS screen should not be shown
 */
createSavedCardsTest({
  avs: false,
});
