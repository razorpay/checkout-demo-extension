const { getDataAttrSelector } = require('./common');

async function openAccounTab(context) {
  const accountTabEle = await getDataAttrSelector(context, 'account-tab-btn');
  await accountTabEle.click();
}

async function openVernacularFromAccountTab(context) {
  const vernacularCta = await getDataAttrSelector(context, 'account-lang-cta');
  await vernacularCta.click();
}

module.exports = {
  openAccounTab,
  openVernacularFromAccountTab,
};
