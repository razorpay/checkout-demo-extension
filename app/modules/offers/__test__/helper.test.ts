import {
  getAppliedOffer,
  getDiscountedAmount,
  isOfferApplicableOnIssuer,
  showOffersOnSelectedCurrency,
} from '../helper';
import { appliedOffer } from 'offers/store/store';
import { tick } from 'svelte';
jest.mock('razorpay', () => ({
  __esModule: true,
  getAmount: () => 5000,
  getCurrency: () => 'INR',
  isOneClickCheckout: () => false,
}));

jest.mock('checkoutframe/offers', () => ({
  __esModule: true,
  getAllOffers: jest
    .fn()
    .mockReturnValue([sampleOffer()]) // rest of the calls will return default value
    .mockReturnValueOnce([]) // first call will return []
    .mockReturnValueOnce([]), // second call will return []
}));

function sampleOffer(): Offers.OfferItem {
  return {
    id: 'offer_Jf1deiENY5fdlb',
    name: 'instant offer',
    payment_method: 'card',
    display_text: '10% off card',
    type: 'instant',
    original_amount: 100000,
    amount: 90000,
    terms: 'Offers terms and conditions',
  };
}

describe('#getAppliedOffer', () => {
  beforeEach(() => {
    appliedOffer.set(sampleOffer());
  });

  test('test getAppliedOffer()', () => {
    expect(getAppliedOffer()).toEqual(sampleOffer());
  });
});

describe('#isOfferApplicableOnIssuer', () => {
  beforeEach(() => {
    appliedOffer.set(null);
  });
  test('test isOfferApplicableOnIssuer', async () => {
    appliedOffer.set({ ...sampleOffer(), issuer: 'HDFC' });
    await tick();
    expect(isOfferApplicableOnIssuer('HDFC')).toBeTruthy();
    expect(isOfferApplicableOnIssuer('ICIC')).toBeFalsy();
  });
  test('test isOfferApplicableOnIssuer amex', async () => {
    appliedOffer.set({ ...sampleOffer(), payment_network: 'Amex' });
    await tick();
    expect(isOfferApplicableOnIssuer('amex')).toBeTruthy();
    expect(isOfferApplicableOnIssuer('ICIC')).toBeTruthy();
  });
  test('test isOfferApplicableOnIssuer invalid case', () => {
    expect(isOfferApplicableOnIssuer('ICIC')).toBeFalsy();
  });
});

describe('#getDiscountedAmount', () => {
  beforeEach(() => {
    appliedOffer.set(null);
  });
  test('test getDiscountedAmount', async () => {
    appliedOffer.set(sampleOffer());
    await tick();
    expect(getDiscountedAmount()).toBe(sampleOffer().amount);
  });
  test('test getDiscountedAmount when no offer', () => {
    expect(getDiscountedAmount()).toBe(5000);
  });
});

describe('#showOffersOnSelectedCurrency', () => {
  beforeEach(() => {
    appliedOffer.set(sampleOffer());
  });
  test('test showOffersOnSelectedCurrency with currency as empty string with no offers', async () => {
    await tick();
    expect(showOffersOnSelectedCurrency('')).toBeFalsy();
  });
  test('test showOffersOnSelectedCurrency with currency as INR string with no offers', async () => {
    await tick();
    expect(showOffersOnSelectedCurrency('INR')).toBeFalsy();
  });
  test('test showOffersOnSelectedCurrency with currency INR', async () => {
    await tick();
    expect(showOffersOnSelectedCurrency('INR')).toBeTruthy();
  });
  test('test showOffersOnSelectedCurrency with currency USD', async () => {
    await tick();
    expect(showOffersOnSelectedCurrency('USD')).toBeFalsy();
  });
  test('test showOffersOnSelectedCurrency with currency as empty string with offers', async () => {
    await tick();
    expect(showOffersOnSelectedCurrency('')).toBeTruthy();
  });
});
