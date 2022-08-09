import { getAppliedOffer } from 'offers/helper';
import { get } from 'svelte/store';
import {
  computeOfferClass,
  appliedOffer,
  isCardValidForOffer,
  amountAfterOffer,
} from '../store';
import { getSession } from 'sessionmanager';
import {
  getOption,
  isASubscription,
  isCustomerFeeBearer,
  isOneClickCheckout,
} from 'razorpay';
import { cardIin, cardNumber, cardTab } from 'checkoutstore/screens/card';
import * as ChargesStore from 'one_click_checkout/charges/store';
import { tick } from 'svelte';
import { getCardFeatures } from 'common/card';
import { getBankFromCardCache } from 'common/bank';
import fetch from 'utils/fetch';

const AMOUNT = 10000;
jest.mock('analytics', () => ({
  track: jest.fn(),
}));

jest.mock('checkoutstore', () => {
  return {
    makeAuthUrl: jest.fn((x) => x),
  };
});
jest.mock('sessionmanager', () => {
  return {
    getSession: jest.fn(() => ({
      updateAmountInHeaderForOffer: jest.fn(),
      getDCCPayload: jest.fn(() => ({})),
      offer: undefined,
      get: jest.fn(),
      getAppliedOffer: jest.fn(() => getAppliedOffer()),
      setAmount: jest.fn(),
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

describe('$appliedOffer', () => {
  beforeEach(() => {
    appliedOffer.set(sampleOffer);
  });

  test('test get(appliedOffer)', () => {
    expect(get(appliedOffer)).toBe(sampleOffer);
  });
});

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

describe('appliedOffer.subscribe for ChargesStore.amount', () => {
  beforeEach(() => {
    (isOneClickCheckout as jest.Mock).mockImplementationOnce(() => true);
  });
  test('with offer', async () => {
    ChargesStore.cartAmount.set(500000);
    await tick();
    appliedOffer.set(sampleOffer);
    await tick();
    expect(get(ChargesStore.amount)).toBe(490000);
  });
  test('without offer', async () => {
    ChargesStore.amount.set(50000);
    await tick();
    ChargesStore.offerAmount.set(0); // reset to zero as old offer set to 10000
    appliedOffer.set(null); // to mock the change
    await tick();
    expect(get(ChargesStore.amount)).toBe(50000);
  });
});

describe('$isCardValidForOffer', () => {
  beforeEach(() => {
    cardTab.set('card');
    cardNumber.set('4111111111111111');
    appliedOffer.set(null);
  });
  test('$isCardValidForOffer CredOffer', async () => {
    appliedOffer.set({
      ...sampleOffer,
      id: 'CRED_experimental_offer',
      payment_method: 'card',
    });
    await tick();
    expect(get(isCardValidForOffer)).toBeTruthy();
  });

  test('$isCardValidForOffer with invalid iin', async () => {
    cardNumber.set('4111');
    await tick();
    appliedOffer.set(sampleOffer);
    await tick();
    expect(get(isCardValidForOffer)).toBeTruthy();
  });

  test('$isCardValidForOffer with invalid payment method', async () => {
    appliedOffer.set({ ...sampleOffer, payment_method: 'upi' });
    await tick();
    expect(get(isCardValidForOffer)).toBeTruthy();
  });

  test('$isCardValidForOffer with valid card offer ,emi_subvention & card iin changed', async () => {
    (getCardFeatures as jest.Mock).mockImplementation(() => {
      return new Promise(async (resolve) => {
        try {
          cardNumber.set('311111');
          resolve(true);
        } catch (e) {}
      });
    });
    appliedOffer.set({ ...sampleOffer, emi_subvention: true });
    expect(get(isCardValidForOffer)).toBeTruthy(); // when it set as iin changed once it will return true
    await tick();
    expect(get(isCardValidForOffer)).toBeFalsy();
  });

  test('$isCardValidForOffer with valid card offer , emi_subvention & amex offer', async () => {
    (getCardFeatures as jest.Mock).mockImplementation(() => {
      return new Promise(async (resolve) => {
        try {
          resolve(true);
        } catch (e) {}
      });
    });
    (getBankFromCardCache as jest.Mock).mockImplementationOnce(() => ({
      name: 'Amex',
      code: 'AMEX',
      logo: '',
    }));
    appliedOffer.set({
      ...sampleOffer,
      emi_subvention: true,
      payment_network: 'AMEX',
    });
    expect(get(isCardValidForOffer)).toBeTruthy(); // when it set as iin changed once it will return true
    await tick();
    (getBankFromCardCache as jest.Mock).mockImplementationOnce(() => ({
      name: 'ICICI',
      code: 'ICIC',
      logo: '',
    }));
    await tick();
    appliedOffer.set({ ...sampleOffer, emi_subvention: true, issuer: 'HDFC' });
    await tick();
    expect(get(isCardValidForOffer)).toBeFalsy();
  });

  test('$isCardValidForOffer with valid offer + subscription + invalid card offer', async () => {
    (isASubscription as jest.Mock).mockImplementationOnce(() => true);
    appliedOffer.set({ ...sampleOffer });
    // match fetch request data
    const fetchParam = (fetch.post as jest.Mock).mock.calls[0][0];
    expect(fetchParam.data).toMatchObject({
      amount: 10000,
      method: 'card',
      'card[number]': get(cardIin),
      order_id: 'test_id',
      offers: [sampleOffer.id],
    });
    await tick();
    expect(get(isCardValidForOffer)).toBeFalsy();
  });
});

describe('$amountAfterOffer', () => {
  beforeEach(() => {
    cardTab.set('card');
    cardNumber.set('4111111111111111');
    appliedOffer.set(null);
  });
  test('valid card offer amount', async () => {
    (fetch.post as jest.Mock).mockImplementationOnce(({ callback }) => {
      callback([sampleOffer.id]);
    });
    await tick();
    appliedOffer.set(sampleOffer);
    await tick();
    expect(get(amountAfterOffer)).toBe(get(appliedOffer)?.amount);
  });

  test('valid card offer amount', async () => {
    (fetch.post as jest.Mock).mockImplementationOnce(({ callback }) => {
      callback([]);
    });
    await tick();
    appliedOffer.set(sampleOffer);
    await tick();
    expect(get(amountAfterOffer)).toBe(AMOUNT);
  });
});
