const { innerText } = require('../../../util');

/**
 * Parses blocks and returns their text
 * @param {Context} context
 *
 * @returns {Array}
 */
async function parseBlocksFromHomescreen(context) {
  const blockElements = await context.page.$$('.home-methods .methods-block');
  let blocks = await Promise.all(
    blockElements.map(
      blockElement =>
        new Promise(async resolve => {
          const title = await innerText(
            await blockElement.$(':scope > .title')
          );
          const subItemElements = await blockElement.$$(
            ':scope > [role=list] > *'
          );
          let items = await Promise.all(
            subItemElements.map(
              subItemElement =>
                new Promise(async resolve => {
                  const itemTitle = await innerText(
                    await subItemElement.$('[slot=title]')
                  );
                  const itemDescription = await innerText(
                    await subItemElement.$('[slot=subtitle]')
                  );

                  resolve({
                    title: itemTitle,
                    description: itemDescription,
                  });
                })
            )
          );

          resolve({
            title,
            items,
          });
        })
    )
  );

  return blocks;
}

module.exports = {
  parseBlocksFromHomescreen,
};
