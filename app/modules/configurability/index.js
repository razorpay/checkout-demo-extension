import { translateExternal } from './translate';
import { getSequencedBlocks } from './sequence';
import { clusterRazorpayBlocks } from './methods';
import { ungroupInstruments } from './ungroup';

import { AVAILABLE_METHODS } from 'common/constants';
import { isMethodEnabled } from 'checkoutstore/methods';
import { shouldSeparateDebitCard } from 'checkoutstore';

/**
 * Returns the available methods
 *
 * @returns {Array<string>}
 */
function getAvailableDefaultMethods() {
  let available = _Arr.filter(AVAILABLE_METHODS, isMethodEnabled);

  /**
   * Cardless EMI and EMI are the same payment option.
   * When we click EMI, it should take to Cardless EMI if
   * cardless_emi is an available method.
   */
  if (
    _Arr.contains(available, 'cardless_emi') &&
    _Arr.contains(available, 'emi')
  ) {
    available = _Arr.remove(available, 'emi');
  }

  /**
   * We do not want to show QR in the primary list
   * of payment options anymore
   */
  available = _Arr.remove(available, 'qr');

  // TODO: Filter based on amount

  // Separate out debit and credit cards
  if (shouldSeparateDebitCard()) {
    available = _Arr.remove(available, 'card');
    available = ['credit_card', 'debit_card'].concat(available);
  }

  return available;
}

/**
 * Creates a block config for rendering
 * @param {Object} options Options passed by the merchant
 * @param {Object} customer
 *
 * @returns {Object}
 */
export function getBlockConfig(options, customer) {
  // Translate external representation to internal representation
  const translated = translateExternal(options);

  // Ungroup instruments for now
  translated.blocks = _Arr.map(translated.blocks, block =>
    ungroupInstruments(block, customer)
  );

  // Remove empty blocks
  translated.blocks = _Arr.filter(
    translated.block,
    block => block.instruments.length > 0
  );

  // Reorder blocks
  const sequentialied = getSequencedBlocks({
    translated,
    original: options,
    methods: getAvailableDefaultMethods(),
  });

  // Group blocks of Razorpay
  const clustered = clusterRazorpayBlocks(sequentialied);

  return {
    blocks: clustered,
    excluded: translated.exclude.instruments,
  };
}
