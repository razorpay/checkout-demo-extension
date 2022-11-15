import { removeNoCostEmiOffers, isNoCostEmiOffer } from 'checkoutframe/offers';
import {
  filterOfferIssuer,
  selectEmiInstrumentForOffer,
} from 'emiV2/helper/offers';
import { emiMethod, selectedBank } from 'emiV2/store';
import type { EMIBANKS, EMIOptionsMap } from 'emiV2/types';
import { appliedOffer } from 'offers/store';
import { tick } from 'svelte';
import { get } from 'svelte/store';

const sampleOffer: Offers.OfferItem = {
  id: 'offer_Jf1deiENY5fdlb',
  name: 'instant offer',
  payment_method: 'emi',
  display_text: '10% off card',
  type: 'instant',
  original_amount: 100000,
  amount: 90000,
};

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

    expect(isNoCostEmiOffer(offer)).toBe(true);
  });

  test('Should return false offer is no cost emi offer', () => {
    let offer: Offers.OfferItem = {
      id: '1234',
      name: 'HDFC NO Cost',
      display_text: 'HDFC NO Cost',
      type: 'instant',
      payment_method: 'emi',
    };

    expect(isNoCostEmiOffer(offer)).toBe(false);
  });
});

describe('Validate: removeNoCostEmiOffers', () => {
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

    expect(JSON.stringify(removeNoCostEmiOffers(offers))).toBe(
      JSON.stringify(expected)
    );
  });
});

describe('Validate: selectEmiInstrumentForOffer', () => {
  test('Set selected bank if offer has a issuer available', async () => {
    const emiProviders: EMIOptionsMap = {
      bank: [
        {
          code: 'HDFC',
          name: 'HDFC bank',
        },
        {
          code: 'ICIC',
          name: 'ICICI bank',
        },
        {
          code: 'AMEX',
          name: 'American Express',
        },
      ],
      other: [
        {
          code: 'zestmoney',
          name: 'Zestmoney',
        },
      ],
    };

    appliedOffer.set({
      ...sampleOffer,
      issuer: 'HDFC',
    });

    selectEmiInstrumentForOffer(emiProviders);
    await tick();
    expect(get(emiMethod)).toBe('bank');
    let expectedBank = { code: 'HDFC', name: 'HDFC bank' };
    expect(JSON.stringify(get(selectedBank))).toBe(
      JSON.stringify(expectedBank)
    );

    appliedOffer.set({
      ...sampleOffer,
      issuer: 'zestmoney',
    });
    selectEmiInstrumentForOffer(emiProviders);
    await tick();
    expect(get(emiMethod)).toBe('other');

    appliedOffer.set({
      ...sampleOffer,
      payment_network: 'AMEX',
    });
    selectEmiInstrumentForOffer(emiProviders);
    expectedBank = { code: 'AMEX', name: 'American Express' };
    await tick();
    expect(JSON.stringify(get(selectedBank))).toBe(
      JSON.stringify(expectedBank)
    );
  });
});

describe('Validate: filterOfferIssuer', () => {
  test('Return true if offer issuer matches the emi bank', async () => {
    appliedOffer.set({
      ...sampleOffer,
      issuer: 'HDFC',
    });

    let emiProvider: EMIBANKS = {
      code: 'HDFC',
      name: 'HDFC bank',
    };

    expect(filterOfferIssuer(emiProvider)).toBeTruthy();

    appliedOffer.set({
      ...sampleOffer,
      issuer: 'ICIC',
    });

    expect(filterOfferIssuer(emiProvider)).toBeFalsy();

    appliedOffer.set({
      ...sampleOffer,
      payment_network: 'AMEX',
    });
    expect(filterOfferIssuer(emiProvider)).toBeFalsy();

    emiProvider = {
      code: 'AMEX',
      name: 'American Express',
    };
    expect(filterOfferIssuer(emiProvider)).toBeTruthy();
  });
});
