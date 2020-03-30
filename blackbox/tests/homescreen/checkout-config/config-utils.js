const { innerText } = require('../../../util');

/**
 * Parses blocks and returns their text
 * @param {Context} context
 *
 * @returns {Array}
 */
async function parseBlocksFromHomescreen(context) {
  const blockElements = await context.page.$$('.home-methods .methods-block');
  let blocks = [];

  for (let i = 0; i < blockElements.length; i++) {
    const blockElement = blockElements[i];

    const title = await innerText(await blockElement.$(':scope > .title'));
    const subItemElements = await blockElement.$$(':scope > [role=list] > *');
    let items = [];

    for (let j = 0; j < subItemElements.length; j++) {
      const subItemElement = subItemElements[j];
      const itemTitle = await innerText(await subItemElement.$('[slot=title]'));
      const itemDescription = await innerText(
        await subItemElement.$('[slot=subtitle]')
      );

      items.push({
        title: itemTitle,
        description: itemDescription,
      });
    }

    blocks.push({
      title,
      items,
    });
  }

  return blocks;
}

module.exports = {
  parseBlocksFromHomescreen,
};
