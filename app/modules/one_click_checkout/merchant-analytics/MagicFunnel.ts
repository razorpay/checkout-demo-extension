import Razorpay from 'common/Razorpay';
import { getOrderId, isOneClickCheckout } from 'razorpay';

export const emitMagicFunnelEvent = (eventName: string, eventData = {}) => {
  if (!eventName || !isOneClickCheckout()) {
    return;
  }

  (Razorpay as any).sendMessage({
    event: 'event',
    data: {
      event: eventName,
      data: {
        ...eventData,
        order_id: getOrderId(),
        timestamp: Date.now(),
      },
    },
  });
};
