import { translateExternal } from './translate';
import { getSequencedBlocks } from './sequence';
import { AVAILABLE_METHODS } from 'common/constants';
import { clusterRazorpayBlocks } from './methods';

/**
 * Creates a block config for rendering
 * @param {Object} options Options passed by the merchant
 *
 * @returns {Object}
 */
export function getBlockConfig(options) {
  // Translate external representation to internal representation
  const translated = translateExternal(options);

  // Reorder blocks
  const sequentialied = getSequencedBlocks({
    translated,
    original: options,
    methods: AVAILABLE_METHODS, // TODO: Should be the actual eligible methods
  });

  // Group blocks of Razorpay
  const clustered = clusterRazorpayBlocks(sequentialied);

  return {
    blocks: clustered,
    excluded: translated.exclude.instruments,
  };
}
