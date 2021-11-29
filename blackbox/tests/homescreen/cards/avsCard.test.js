const createCardsTest = require('../../../create/cards');

/**
 * Test AVS without DCC enabled with internation card
 * Expected: AVS screen should be shown
 */

createCardsTest({
  avs: true,
  internationalCard: true,
});
