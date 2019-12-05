const { delay, visible } = require('../util');

async function viewOffers(context) {
  await context.page.click('.offers-title');
}

async function selectOffer(context, offernumber) {
  await context.page.click('.offer.item:nth-of-type(' + offernumber + ')');
  await context.page.click('button[class = "button apply-offer"]');
}

async function setPreferenceForOffer(preferences) {
  preferences.methods.emi_options.ICIC[0].subvention = 'merchant';
  preferences.methods.emi_options.ICIC[1].subvention = 'merchant';
  preferences.methods.emi_options.ICIC[0].offer_id = 'offer_DWcdgbZjWPlmou';
  preferences.methods.emi_options.ICIC[1].offer_id = 'offer_DWcdgbZjWPlmou';
  return preferences;
}

async function verifyOfferApplied(context) {
  expect(await context.page.$eval('.selected-offer', visible)).toEqual(true);
}

module.exports = {
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
};
