import Razorpay from 'common/Razorpay';
import { isOneClickCheckout } from 'razorpay';
import { MAGIC_FUNNEL } from 'one_click_checkout/merchant-analytics/constant';
import { emitMagicFunnelEvent } from 'one_click_checkout/merchant-analytics/MagicFunnel';

const ORDER_ID = 'order_KBrMyS1jyO0w8w';

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
    getOrderId: () => ORDER_ID,
    isOneClickCheckout: jest.fn(),
  };
});

describe('emitMagicFunnel event tests', () => {
  it('should not emit event for std checkout', () => {
    isOneClickCheckout.mockReturnValue(false);

    emitMagicFunnelEvent(MAGIC_FUNNEL.PAYMENTS_SCREEN);
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });

  it('should not emit event if eventName not passed', () => {
    isOneClickCheckout.mockReturnValue(true);

    emitMagicFunnelEvent();
    expect(Razorpay.sendMessage).not.toHaveBeenCalled();
  });

  it('should construct sendMessage argument object', () => {
    isOneClickCheckout.mockReturnValue(true);

    const eventName = 'test';
    const eventData = { user: 'xyz' };
    Date.now = jest.fn(() => 1664363839565);
    const arg = {
      event: 'event',
      data: {
        event: eventName,
        data: { ...eventData, order_id: ORDER_ID, timestamp: Date.now() },
      },
    };
    emitMagicFunnelEvent(eventName, eventData);
    expect(Razorpay.sendMessage).toHaveBeenCalledWith(arg);
  });
});
