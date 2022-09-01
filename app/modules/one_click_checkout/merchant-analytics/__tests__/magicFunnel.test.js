import Razorpay from 'common/Razorpay';
import { emitMagicFunnelEvent } from 'one_click_checkout/merchant-analytics/MagicFunnel';

jest.mock('common/Razorpay', () => {
  const originalModule = jest.requireActual('common/Razorpay');
  return {
    ...originalModule,
    sendMessage: jest.fn(),
  };
});

describe('emitMagicFunnel event tests', () => {
  it('should not emit event if eventName not passed', () => {
    emitMagicFunnelEvent();
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });

  it('should construct sendMessage argument object', () => {
    const eventName = 'test';
    const eventData = { user: 'xyz' };

    const arg = {
      event: 'event',
      data: {
        event: eventName,
        data: eventData,
      },
    };

    emitMagicFunnelEvent(eventName, eventData);
    expect(Razorpay.sendMessage).toHaveBeenCalledWith(arg);
  });
});
