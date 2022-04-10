const { getDataAttrSelector } = require('./common');

async function openAccounTab(context) {
  const accountTabEle = await getDataAttrSelector(context, 'account-tab-btn');
  await accountTabEle.click();
}

async function openVernacularFromAccountTab(context) {
  const vernacularCta = await getDataAttrSelector(context, 'account-lang-cta');
  await vernacularCta.click();
}

async function logoutFromAccountTab(context, logoutAll) {
  const logoutCta = await getDataAttrSelector(
    context,
    logoutAll ? 'account-logoutall-cta' : 'account-logout-cta'
  );
  await logoutCta.click();
}

async function openContactFromAccountTab(context) {
  const contactCta = await getDataAttrSelector(context, 'edit-contact-account');
  await contactCta.click();
}

module.exports = {
  openAccounTab,
  openVernacularFromAccountTab,
  logoutFromAccountTab,
  openContactFromAccountTab,
};
