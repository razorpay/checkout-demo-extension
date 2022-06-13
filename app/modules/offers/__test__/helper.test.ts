import {
  getAppliedOffer,
  getDiscountedAmount,
  isOfferApplicableOnIssuer,
} from '../helper';
import { appliedOffer } from 'offers/store';
import { tick } from 'svelte';

jest.mock('razorpay', () => ({
  __esModule: true,
  getAmount: () => 5000,
  isOneClickCheckout: () => false,
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
