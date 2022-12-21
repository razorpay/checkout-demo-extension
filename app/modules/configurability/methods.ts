import { createBlock } from './blocks';
import { ungroupInstruments } from './ungroup';
import type { Block } from 'configurability/types';
import type { Method } from 'types/types';

/**
 * Creates a method block
 * @param {string} method
 *
 * @returns {Block}
 */
export function createMethodBlock(method: Method) {
  let block = createBlock(method) as Block;

  block = Object.assign(block, {
    method,
    _type: 'rzp_method',
  });

  return block;
}

/**
 * Clusters Razorpay blocks
 * @param {Array<Block>} blocks
 *
 * @returns {Array<Block>}
 */
export function clusterRazorpayBlocks(blocks: Block[]) {
  const clustered: Block[] = [];
  let cluster: Block[] = [];

  function checkAndPushCluster() {
    if (cluster.length) {
      const rzpBlock = createBlock('rzp.cluster', {
        instruments: cluster,
      }) as Block;

      clustered.push(rzpBlock);

      // Reset
      cluster = [];
    }
  }

  blocks.forEach((block) => {
    const isRazorpayMethodBlock = block._type === 'rzp_method';

    if (isRazorpayMethodBlock) {
      // Add to cluster
      cluster.push(block);
    } else {
      // If not a razorpay block, push created cluster
      checkAndPushCluster();

      // Push this block
      clustered.push(block);
    }
  });

  // Push any pending clusters
  checkAndPushCluster();

  return clustered.map((block) => ungroupInstruments(block));
}
