import { render } from '@testing-library/svelte';
import { UPIAppStack } from '.';
import { isUPIFlowEnabled } from 'checkoutstore/methods';
import { setWithoutOffer, isCtaShown, showCtaWithDefaultText } from 'cta';

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    themeMeta: {
      icons: {
        saved_card: '',
      },
    },
  }),
}));

jest.mock('checkoutstore/methods', () => ({
  isUPIFlowEnabled: jest.fn(() => true),
}));

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  get: jest.fn(),
  isOneClickCheckout: () => false,
  isCustomerFeeBearer: () => false,
  isOfferForced: () => false,
  getPreferences: () => {},
  isRecurring: () => false,
  getMerchantKey: () => '',
}));

jest.mock('cta', () => ({
  __esModule: true,
  ...jest.requireActual('cta'),
  setWithoutOffer: jest.fn(),
  isCtaShown: () => false,
  showCtaWithDefaultText: jest.fn(),
  CTAHelper: {
    setActiveCTAScreen: jest.fn(),
  },
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
