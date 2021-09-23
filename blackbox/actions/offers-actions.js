const { delay, visible } = require('../util');

async function viewOffers(context) {
  await context.page.click('.offer-action');
}

async function selectOffer(context, offernumber) {
  await context.page.click('.offer-item:nth-of-type(' + offernumber + ')');
  await context.page.click('#footer');
}

async function setPreferenceForOffer(preferences) {
  preferences.methods.emi_options.AMEX[0].subvention = 'merchant';
  preferences.methods.emi_options.AMEX[1].subvention = 'merchant';
  preferences.methods.emi_options.AMEX[0].offer_id = 'offer_DWchUIIT6QYX76';
  preferences.methods.emi_options.AMEX[1].offer_id = 'offer_DWchUIIT6QYX76';
  return preferences;
}

async function verifyOfferApplied(context) {
  expect(
    await context.page.$eval('.offer-action', (el) => el.innerText)
  ).toEqual('Change');
}

async function validateCardForOffer(context) {
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('validate/checkout/offers');
  await context.respondJSON([1]);
}

async function removeOffer(context, offernumber) {
  await context.page.click(
    '.offer-item:nth-of-type(' + offernumber + ') .remove-offer'
  );
}

async function verifyOfferNotApplied(context) {
  expect(
    await context.page.$eval('.offer-action', (el) => el.innerText)
  ).toEqual('Select');
}

module.exports = {
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
  validateCardForOffer,
  removeOffer,
  verifyOfferNotApplied,
};
