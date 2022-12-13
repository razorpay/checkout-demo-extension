import Razorpay from 'common/Razorpay';
import { moengageAnalytics } from '..';
import { isOneClickCheckout, isMoEngageAnalyticsEnabled } from 'razorpay';

jest.mock('common/Razorpay', () => {
  return {
    sendMessage: jest.fn(),
  };
});

jest.mock('razorpay', () => {
  return {
    isOneClickCheckout: jest.fn(),
    isMoEngageAnalyticsEnabled: jest.fn(),
  };
});

describe('moengageAnalytics tests', () => {
  it('should not emit event for std checkout', () => {
    isOneClickCheckout.mockReturnValue(false);

    moengageAnalytics({});
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });

  it('should not emit event if option is not enabled', () => {
    isOneClickCheckout.mockReturnValue(true);
    isMoEngageAnalyticsEnabled.mockReturnValue(false);
    moengageAnalytics({});
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });

  it('should emit event', () => {
    isOneClickCheckout.mockReturnValue(true);
    isMoEngageAnalyticsEnabled.mockReturnValue(true);
    const arg = {
      event: 'moengageevent',
      data: {},
    };

    moengageAnalytics({});
    expect(Razorpay.sendMessage).toHaveBeenNthCalledWith(1, arg);
  });
});
