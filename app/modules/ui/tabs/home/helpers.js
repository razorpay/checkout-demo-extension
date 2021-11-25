import { get } from 'svelte/store';
import { cardsSeparation } from 'card/experiments';
import { creditCardConfig, debitCardConfig } from './constants';
import { isMethodEnabled } from 'checkoutstore/methods';

import { blocks } from 'checkoutstore/screens/home';

// Dynamic Fee Bearer
import { setDynamicFeeObject } from 'checkoutstore/dynamicfee';
import { isDynamicFeeBearer } from 'checkoutstore/index';

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
  if (cardsSeparation.enabled() && isMethodEnabled('card')) {
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

export function getAvailableMethods() {
  return get(blocks).map((block) =>
    block.instruments.map((instrument) => instrument.method)
  );
}

export function setDynamicFees(instrument, forType) {
  if (isDynamicFeeBearer()) {
    if (forType === 'rzpCluster') {
      let types = ['debit_card', 'credit_card'];

      let inst = types.includes(instrument?.method)
        ? 'card'
        : instrument?.method;
      let type =
        instrument?.method === 'debit_card'
          ? 'debit'
          : instrument?.method === 'credit_card'
          ? 'credit'
          : '';
      if (inst !== 'card') {
        return setDynamicFeeObject(inst);
      }
    }
    if (forType === 'newList') {
      let method = instrument?.method;
      let type = instrument?.types?.[0] || '';
      if (method !== 'card') {
        return setDynamicFeeObject(method);
      }
    }
  }
}
