import { BEHAV, API } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';
import type { Instrument, Method } from 'analytics-v2/types';

export const PaymentEvents = {
  SUBMIT: { name: 'submit', type: BEHAV },
  PAYMENT_INITIATED_SYSTEM: { name: 'payment_initiated_system', type: API },
  PAYMENT_SUCCESSFUL: { name: 'payment_successful', type: API },
  PAYMENT_FAILED: { name: 'payment_failed', type: API },
};

interface PaymentEventMap {
  SUBMIT: {
    block: {
      name: string;
      category: string;
    };
    method: Method;
    instrument: Instrument;
  };
  PAYMENT_INITIATED_SYSTEM: {
    method: Method;
    instrument: Instrument;
  };
  PAYMENT_SUCCESSFUL: {
    method: Method;
    instrument: Instrument;
  };
  PAYMENT_FAILED: {
    method: Method;
    instrument: Instrument;
  };
}

export const PaymentTracker =
  createTrackMethodForModule<PaymentEventMap>(PaymentEvents);
