import { createBlock } from './blocks';
import { getMethodPrefix } from 'checkoutframe/paymentmethods';
import { generateTextFromList } from 'lib/utils';

/**
 * Adds a name to the clusters in the list of blocks
 * @param {Array<Block>} blocks
 *
 * @returns {Array<Blocks>}
 */
function getBlocksWithNamedClusters(blocks) {
  const rzpBlocks = _Arr.filter(blocks, block => block.code === 'rzp.cluster');
  const totalRzpBlocks = rzpBlocks.length;

  // If there are no razorpay blocks, don't process
  if (totalRzpBlocks === 0) {
    return blocks;
  }

  blocks = _Arr.map(blocks, block => {
    const isRzpBlock = block.code === 'rzp.cluster';

    // Not a razorpay block. Do nothing.
    if (!isRzpBlock) {
      return block;
    }

    const methods =
      block.instruments |> _Arr.map(instrument => instrument.method);
    const names = methods |> _Arr.map(getMethodPrefix);

    let name;

    /**
     * For just one method, use "Pay via {method}"
     * For more, use generateTextFromList
     */
    if (names.length === 1) {
      name = `Pay via ${names[0]}`;
    } else {
      name = generateTextFromList(names, 3);
    }

    // Recreate the block with the name
    return createBlock(
      block.code,
      _Obj.extend(block, {
        name,
      })
    );
  });

  return blocks;
}

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
    type: 'rzp_method',
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

  _Arr.loop(blocks, block => {
    const isRazorpayMethodBlock = block.type === 'rzp_method';

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

  return clustered |> getBlocksWithNamedClusters;
}
