import { createBlock } from './blocks';
import { ungroupInstruments } from './ungroup';

/**
 * Creates a method block
 * @param {string} method
 *
 * @returns {Block}
 */
export function createMethodBlock(method) {
  let block = createBlock(method);

  block = _Obj.extend(block, {
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
export function clusterRazorpayBlocks(blocks) {
  const clustered = [];
  let cluster = [];

  function checkAndPushCluster() {
    if (cluster.length) {
      const rzpBlock = createBlock('rzp.cluster', {
        instruments: cluster,
      });

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

  return _Arr.map(clustered, ungroupInstruments);
}
