import { render } from '@testing-library/svelte';
import { UPIAppStack } from '.';

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    themeMeta: {
      icons: {
        saved_card: '',
      },
    },
  }),
}));

jest.mock('razorpay', () => ({
  get: jest.fn(),
  isOneClickCheckout: () => false,
  isCustomerFeeBearer: () => false,
  isOfferForced: () => false,
  getPreferences: () => {},
  isRecurring: () => false,
  getMerchantKey: () => '',
}));

jest.mock('checkoutstore/cta', () => ({
  setWithoutOffer: jest.fn(),
  isCtaShown: () => false,
  showCtaWithDefaultText: jest.fn(),
}));

describe('UPI App Stack Component', () => {
  (global as any).razorpay = {
    get: jest.fn(),
  };
  it('should be rendered', async () => {
    const result = render(UPIAppStack, {
      method: 'upi',
      onOtherClick: console.log,
      onAppClick: undefined,
    });
    expect(result).toBeTruthy();
  });
});
