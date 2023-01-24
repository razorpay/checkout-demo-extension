const { makeJSONResponse } = require('../../util');

async function handleGetUpdatedOffers(context, orderId, features) {
  const { enableFixExp } = features;
  if (!enableFixExp) {
    return;
  }

  let request = await context.getRequest(`order/${orderId}/payment_offers`);
  if (!request) {
    request = await context.expectRequest();
    expect(request.url).toContain(`order/${orderId}/payment_offers`);
    expect(request.method).toBe('GET');
    await context.respondJSON({ offers: getOffersList(features) });
    return;
  }
  request.respond(makeJSONResponse({ offers: getOffersList(features) }));
  context.resetRequest(request);
}

function getOffersList(features = {}) {
  const { amount } = features;
  return [
    {
      original_amount: amount,
      amount: amount - 20 * 100,
      id: 'offer_DdMaQ3KHyKxcDN',
      name: 'Card Offer VISA',
      payment_method: 'card',
      payment_network: 'VISA',
      terms: `Offer terms and conditions`,
      display_text: 'Display text for VISA Offer',
    },
    {
      original_amount: amount,
      amount: 0,
      id: 'offer_DdOL4XeZosJh2t',
      name: 'Card Offer - MasterCard 20',
      payment_method: 'card',
      payment_network: 'MC',
      display_text: 'Display text for MC Offer',
    },
    {
      original_amount: amount,
      amount: amount - 20 * 100,
      id: 'offer_Dcad1sICBaV2wI',
      name: 'UPI Offer Name',
      payment_method: 'upi',
      display_text: 'UPI Offer Display Text',
    },
    {
      original_amount: amount,
      amount: 0,
      id: 'offer_DcaetTeD4Gjcma',
      name: 'UPI Offer Name 2',
      payment_method: 'upi',
      display_text: 'UPI Offer Display Text 2',
    },
  ];
}

module.exports = {
  handleGetUpdatedOffers,
  getOffersList,
};
