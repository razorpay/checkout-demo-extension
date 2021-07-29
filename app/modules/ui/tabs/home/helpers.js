import { isCardsSeparationExperimentEnabled } from 'experiments/all/cards-separation';
import { creditCardConfig, debitCardConfig } from './constants';
import { isMethodEnabled } from 'checkoutstore/methods';

function getSplitConfig() {
  const config = [];
  if (isMethodEnabled('debit_card')) config.push(debitCardConfig);
  if (isMethodEnabled('credit_card')) config.push(creditCardConfig);
  return config;
}

/**
 *
 * @param {block[]} allBlocks
 * This method updates the blocks as per the experiments running
 * This method works on pass-by-reference
 */
export function updateBlocksForExperiments(allBlocks) {
  if (isCardsSeparationExperimentEnabled() && isMethodEnabled('card')) {
    for (const blockKey in allBlocks) {
      const { code, instruments } = allBlocks[blockKey];
      if (code === 'rzp.cluster') {
        const cardInstrumentIndex = instruments?.findIndex(
          (instrument) => instrument?.code === 'card'
        );
        if (cardInstrumentIndex > -1) {
          instruments.splice(cardInstrumentIndex, 1, ...getSplitConfig());
        }
      }
    }
  }
}
