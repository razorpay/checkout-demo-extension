import { BEHAV, API } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';

export const PaymentEvents = {
  SUBMIT: { name: 'submit', type: BEHAV },
  PAYMENT_INITIATED_SYSTEM: { name: 'payment_initiated_system', type: API },
  PAYMENT_SUCCESSFUL: { name: 'payment_successful', type: API },
  PAYMENT_FAILED: { name: 'payment_failed', type: API },
};

interface METHOD {
  name: string;
}

interface Instrument {
  name?: string;
  saved: boolean;
  personalisation: boolean;
  network?: string;
  vpa?: string;
  issuer?: string;
  type?: string;
}

interface PaymentEventMap {
  SUBMIT: {
    block: {
      name: string;
      category: string;
    };
    method: METHOD;
    instrument: Instrument;
  };
  PAYMENT_INITIATED_SYSTEM: {
    method: METHOD;
    instrument: Instrument;
  };
  PAYMENT_SUCCESSFUL: {
    method: METHOD;
    instrument: Instrument;
  };
  PAYMENT_FAILED: {
    method: METHOD;
    instrument: Instrument;
  };
}

export const PaymentTracker =
  createTrackMethodForModule<PaymentEventMap>(PaymentEvents);
