import { getAppliedOffer } from 'offers/helper';
import { get } from 'svelte/store';
import { computeOfferClass, appliedOffer } from '..';
import { getSession } from 'sessionmanager';
import { getOption, isCustomerFeeBearer, isOneClickCheckout } from 'razorpay';
import * as ChargesStore from 'one_click_checkout/charges/store';

const AMOUNT = 10000;
jest.mock('analytics', () => ({
  track: jest.fn(),
}));

jest.mock('cta', () => ({
  isCtaShown: () => true,
  setWithoutOffer: jest.fn(),
  setAppropriateCtaText: jest.fn(),
}));

jest.mock('checkoutstore', () => {
  return {
    makeAuthUrl: jest.fn((x) => x),
  };
});
jest.mock('sessionmanager', () => {
  return {
    getSession: jest.fn(() => ({
      getDCCPayload: jest.fn(() => ({})),
      offer: undefined,
      get: jest.fn(),
      getAppliedOffer: jest.fn(() => getAppliedOffer()),
      setAmount: jest.fn(),
      updateAmountInHeaderForOffer: jest.fn(),
    })),
  };
});

jest.mock('common/card', () => ({
  ...jest.requireActual('common/card'),
  getCardFeatures: jest.fn(),
}));
jest.mock('common/bank', () => ({
  ...jest.requireActual('common/bank'),
  getBankFromCardCache: jest.fn(),
}));

jest.mock('utils/fetch', () => ({
  post: jest.fn(({ callback }) => {
    callback([]);
  }),
}));

// (cardMethod as any).getCardFeatures = jest.fn(
//   () => new Promise((resolve) => resolve(true))
// );

jest.mock('razorpay', () => ({
  __esModule: true,
  isRedesignV15: () => false,
  getCurrency: () => 'INR',
  isOneClickCheckout: jest.fn(() => false),
  getOption: jest.fn((opt) => {
    if (opt === 'currency') {
      return 'INR';
    }
  }),
  isASubscription: jest.fn(() => false),
  getOrderId: jest.fn(),
  isCustomerFeeBearer: jest.fn(() => false),
  getAmount: jest.fn(() => AMOUNT),
  getSubscription: jest.fn(() => ({ order_id: 'test_id' })),
  getPreferences: jest.fn(),
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

describe('$computeOfferClass', () => {
  beforeEach(() => {
    appliedOffer.set(sampleOffer);
  });

  test('test get(computeOfferClass)', () => {
    (getOption as jest.Mock).mockImplementationOnce(() => undefined);
    expect(get(computeOfferClass)).toMatchObject({
      hasFee: false,
      hasDiscount: true,
      discountAmount: '₹ 900',
      hideOriginalAmount: false,
    });
  });

  test('test get(computeOfferClass) with 1cc enable', () => {
    ChargesStore.amount.set(5000);

    (isOneClickCheckout as jest.Mock).mockImplementationOnce(() => true);
    expect(get(computeOfferClass)).toMatchObject({
      hasFee: false,
      hasDiscount: true,
      discountAmount: '₹ 50',
      hideOriginalAmount: false,
    });
  });

  test('test get(computeOfferClass) with dccPayload', () => {
    (getSession as jest.Mock).mockImplementationOnce(() => ({
      getDCCPayload: () => ({ currency: 'USD', amount: 5000 }),
      updateAmountInHeaderForOffer: jest.fn(),
    }));
    expect(get(computeOfferClass)).toMatchObject({
      hasFee: false,
      hasDiscount: true,
      discountAmount: '$ 50',
      hideOriginalAmount: false,
    });
  });

  test('test get(computeOfferClass) with customer fee bearer', () => {
    (isCustomerFeeBearer as jest.Mock).mockImplementationOnce(() => true);
    expect(get(computeOfferClass)).toMatchObject({
      hasFee: true,
      hasDiscount: true,
      discountAmount: '₹ 900',
      hideOriginalAmount: false,
    });
  });

  test('test get(computeOfferClass) with session.offer defined', () => {
    (getSession as jest.Mock).mockImplementationOnce(() => ({
      offers: jest.fn(),
      getDCCPayload: jest.fn(() => ({})),
      updateAmountInHeaderForOffer: jest.fn(),
    }));
    expect(get(computeOfferClass)).toMatchObject({
      hasFee: false,
      hasDiscount: true,
      discountAmount: '₹ 900',
      hideOriginalAmount: false,
    });
  });
});
