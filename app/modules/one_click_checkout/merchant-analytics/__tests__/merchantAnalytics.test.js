import Razorpay from 'common/Razorpay';
import { merchantAnalytics, merchantFBStandardAnalytics } from '..';
import {
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
  isOneClickCheckout,
  getCustomerCart,
} from 'razorpay';

const cartObj = {
  currency: 'INR',
  value: '3499.0',
  content_type: 'product',
  contents: [
    {
      id: 7178915414052,
      variant_id: 40494626242596,
      name: 'Amazfit Band 7',
      value: '3499.0',
      quantity: 1,
    },
  ],
};

jest.mock('common/Razorpay', () => {
  const originalModule = jest.requireActual('common/Razorpay');
  return {
    ...originalModule,
    sendMessage: jest.fn(),
  };
});

jest.mock('razorpay', () => {
  const originalModule = jest.requireActual('razorpay');
  return {
    ...originalModule,
    isOneClickCheckout: jest.fn(),
    isFacebookAnalyticsEnabled: jest.fn(),
    isGoogleAnalyticsEnabled: jest.fn(),
    getCustomerCart: jest.fn(),
  };
});

describe('merchantAnalytics tests', () => {
  it('should not emit event for std checkout', () => {
    isOneClickCheckout.mockReturnValue(false);

    merchantAnalytics({});
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();

    merchantFBStandardAnalytics();
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });

  it('should not emit event if option is not enabled', () => {
    isGoogleAnalyticsEnabled.mockReturnValue(false);
    isOneClickCheckout.mockReturnValue(true);
    isFacebookAnalyticsEnabled.mockReturnValue(true);

    merchantAnalytics({});
    const arg = {
      event: 'gaevent',
      data: {},
    };
    expect(Razorpay.sendMessage).not.toHaveBeenNthCalledWith(1, arg);
    expect(Razorpay.sendMessage).toHaveBeenNthCalledWith(1, {
      ...arg,
      event: 'fbaevent',
    });

    isGoogleAnalyticsEnabled.mockReturnValue(true);
    isFacebookAnalyticsEnabled.mockReturnValue(false);
    merchantAnalytics({});
    expect(Razorpay.sendMessage).toHaveBeenNthCalledWith(2, arg);
    expect(Razorpay.sendMessage).not.toHaveBeenNthCalledWith(2, {
      ...arg,
      event: 'fbaevent',
    });
  });

  it('should not emit pixel event if customer cart is not there', () => {
    getCustomerCart.mockReturnValue({});
    isOneClickCheckout.mockReturnValue(true);
    isFacebookAnalyticsEnabled.mockReturnValue(true);

    merchantFBStandardAnalytics({});
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });
});
