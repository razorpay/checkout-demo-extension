/**
 * Creates a node for the Trie
 * @param {*} data
 *
 * @returns {Node}
 */
function createNode(data) {
  return {
    data,
    branches: {},
    leaf: true,
  };
}

/**
 * Creates a trie from a list of strings
 * @param {Array} list
 *
 * @returns {Trie}
 */
function createTrie(list) {
  const trie = createNode('');

  list.forEach(item => {
    let root = trie;

    item.split('').forEach(digit => {
      root.leaf = false;

      if (!root.branches[digit]) {
        root.branches[digit] = createNode(digit);
      }

      root = root.branches[digit];
    });
  });

  return trie;
}

/**
 * Turns a trie into a regex
 * @param {Node} node
 *
 * @returns {string}
 */
function regexifyTrie(node) {
  if (node.leaf) {
    return node.data;
  }

  const keys = Object.keys(node.branches);

  const children = keys.map(key => {
    return regexifyTrie(node.branches[key]);
  });

  if (children.length === 1) {
    return `${node.data}${children[0]}`;
  }

  return `${node.data}(${children.join('|')})`;
}

/**
 * Turns a list of strings into a regex
 * @param {Array} list
 *
 * @returns {string}
 */
function regexify(list) {
  return regexifyTrie(createTrie(list));
}

module.exports = regexify;
