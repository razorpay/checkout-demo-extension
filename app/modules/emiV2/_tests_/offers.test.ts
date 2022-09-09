import { filterNoCostEmiOffers, isNoCostEmiOffer } from 'checkoutframe/offers';

describe('Validate: isNoCostEmiOffer', () => {
  test('Should return true offer is no cost emi offer', () => {
    let offer: Offers.OfferItem = {
      id: '1234',
      name: 'HDFC NO Cost',
      display_text: 'HDFC NO Cost',
      type: 'instant',
      emi_subvention: true,
      payment_method: 'emi',
    };

    expect(isNoCostEmiOffer(offer)).toBe(false);
  });

  test('Should return false offer is no cost emi offer', () => {
    let offer: Offers.OfferItem = {
      id: '1234',
      name: 'HDFC NO Cost',
      display_text: 'HDFC NO Cost',
      type: 'instant',
      payment_method: 'emi',
    };

    expect(isNoCostEmiOffer(offer)).toBe(true);
  });
});

describe('Validate: filterNoCostEmiOffers', () => {
  let offers: Offers.OffersList = [
    {
      id: '1234',
      name: 'HDFC 10% off on EMI',
      display_text: 'HDFC NO Cost',
      type: 'instant',
      payment_method: 'emi',
    },
    {
      id: '1234',
      name: 'HDFC NO Cost',
      display_text: 'HDFC NO Cost',
      type: 'instant',
      emi_subvention: true,
      payment_method: 'emi',
    },
  ];

  test('Should filter out no cost emi offers', () => {
    let expected = [
      {
        id: '1234',
        name: 'HDFC 10% off on EMI',
        display_text: 'HDFC NO Cost',
        type: 'instant',
        payment_method: 'emi',
      },
    ];

    expect(JSON.stringify(filterNoCostEmiOffers(offers))).toBe(
      JSON.stringify(expected)
    );
  });
});
