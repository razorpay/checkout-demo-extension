import {
  getAppliedOffer,
  getDiscountedAmount,
  isOfferApplicableOnIssuer,
  showOffersOnSelectedCurrncy,
} from '../helper';
import { appliedOffer } from 'offers/store';
import { tick } from 'svelte';
jest.mock('razorpay', () => ({
  __esModule: true,
  getAmount: () => 5000,
  isOneClickCheckout: () => false,
}));

jest.mock('checkoutframe/offers', () => ({
  __esModule: true,
  getAllOffers: jest
    .fn()
    .mockReturnValue([sampleOffer]) // rest of the calls will return default value
    .mockReturnValueOnce([]) // first call will return []
    .mockReturnValueOnce([]), // second call will return []
}));

const sampleOffer: Offers.OfferItem = {
  id: 'offer_Jf1deiENY5fdlb',
  name: 'instant offer',
  payment_method: 'card',
  display_text: '10% off card',
  type: 'instant',
  original_amount: 100000,
  amount: 90000,
};

describe('#getAppliedOffer', () => {
  beforeEach(() => {
    appliedOffer.set(sampleOffer);
  });

  test('test getAppliedOffer()', () => {
    expect(getAppliedOffer()).toBe(sampleOffer);
  });
});

describe('#isOfferApplicableOnIssuer', () => {
  beforeEach(() => {
    appliedOffer.set(null);
  });
  test('test isOfferApplicableOnIssuer', async () => {
    appliedOffer.set({ ...sampleOffer, issuer: 'HDFC' });
    await tick();
    expect(isOfferApplicableOnIssuer('HDFC')).toBeTruthy();
    expect(isOfferApplicableOnIssuer('ICIC')).toBeFalsy();
  });
  test('test isOfferApplicableOnIssuer amex', async () => {
    appliedOffer.set({ ...sampleOffer, payment_network: 'Amex' });
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
    appliedOffer.set(sampleOffer);
    await tick();
    expect(getDiscountedAmount()).toBe(sampleOffer.amount);
  });
  test('test getDiscountedAmount when no offer', () => {
    expect(getDiscountedAmount()).toBe(5000);
  });
});

describe('#showOffersOnSelectedCurrncy', () => {
  beforeEach(() => {
    appliedOffer.set(sampleOffer);
  });
  test('test showOffersOnSelectedCurrncy with currency as empty string with no offers', async () => {
    await tick();
    expect(showOffersOnSelectedCurrncy('')).toBeFalsy();
  });
  test('test showOffersOnSelectedCurrncy with currency as INR string with no offers', async () => {
    await tick();
    expect(showOffersOnSelectedCurrncy('INR')).toBeFalsy();
  });
  test('test showOffersOnSelectedCurrncy with currency INR', async () => {
    await tick();
    expect(showOffersOnSelectedCurrncy('INR')).toBeTruthy();
  });
  test('test showOffersOnSelectedCurrncy with currency USD', async () => {
    await tick();
    expect(showOffersOnSelectedCurrncy('USD')).toBeFalsy();
  });
  test('test showOffersOnSelectedCurrncy with currency as empty string with offers', async () => {
    await tick();
    expect(showOffersOnSelectedCurrncy('')).toBeTruthy();
  });
});
