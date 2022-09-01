import Razorpay from 'common/Razorpay';

export const emitMagicFunnelEvent = (eventName: string, eventData = {}) => {
  if (!eventName) {
    return;
  }

  (Razorpay as any).sendMessage({
    event: 'event',
    data: {
      event: eventName,
      data: eventData,
    },
  });
};
