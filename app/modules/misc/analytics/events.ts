import { API, BEHAV, INTEGRATION, RENDER } from 'analytics-types';
import { createTrackMethodForModule, FUNNEL_NAMES } from 'analytics-v2';
import type {
  Block,
  Instrument,
  Method,
  MethodAndInstrument,
} from 'analytics-v2/types';
import type { LOGIN_SOURCE_TYPES } from './constants';

export const MiscEvents = {
  OPEN: { name: 'checkout_open', type: RENDER },
  INVOKED: { name: 'checkout_invoked', type: INTEGRATION },
  CONTACT_NUMBER_FILLED: { name: 'contact_number_filled', type: BEHAV },
  EMAIL_FILLED: { name: 'email_filled', type: BEHAV },
  CONTACT_DETAILS: { name: 'contact_details', type: RENDER },
  METHOD_SELECTION_SCREEN: { name: 'method_selection_screen', type: RENDER },
  CONTACT_DETAILS_PROCEED_CLICK: {
    name: 'contact_details_proceed_clicked',
    type: BEHAV,
  },
  INSTRUMENTATION_SELECTION_SCREEN: {
    name: 'Instrument_selection_screen',
    type: RENDER,
  },
  METHOD_SELECTED: {
    name: 'Method:selected',
    type: BEHAV,
  },
  INSTRUMENT_SELECTED: { name: 'instrument:selected', type: BEHAV },
  USER_LOGGED_IN: { name: 'user_logged_in', type: BEHAV },
};

export const RetryEvents = {
  RETRY_BUTTON: { name: 'retry_button', type: RENDER },
  RETRY_CLICKED: { name: 'retry_ckicked', type: BEHAV },
  AFTER_RETRY_SCREEN: { name: 'after_retry_screen', type: RENDER },
  RETRY_VANISHED: { name: 'retry_vanished', type: BEHAV },
  PAYMENT_CANCELLED: { name: 'payment_cancelled', type: BEHAV },
};

export const P13NEvents = {
  P13N_INITIATED: { name: 'p13n_initiated', type: API },
  P13N_RESPONSE: { name: 'p13n_response', type: API },
  P13N_CALL_FAILED: { name: 'p13n_call_failed', type: API },
  P13N_SECTION: { name: 'p13n_section', type: RENDER },
  P13N_METHOD_SHOWN: { name: 'p13n_methods_shown', type: RENDER },
};

interface MiscEventMap {
  OPEN: {
    user: {
      contact: {
        hidden: boolean;
        value: string;
      };
      email: {
        hidden: boolean;
        value: string;
      };
    };
  };
  INVOKED: {
    prefill: {
      contact: string;
      email: string;
      method: string;
    };
  };
  CONTACT_NUMBER_FILLED: {
    user: {
      contact: {
        value: string;
      };
    };
  };
  EMAIL_FILLED: {
    user: {
      email: {
        value: string;
      };
    };
  };
  CONTACT_DETAILS: undefined;
  METHOD_SELECTION_SCREEN: {
    blocks: {
      [key: string]: {
        name: string;
        category: string;
        order: number;
        instruments?: {
          [key: number]: {
            order: number;
            method: string;
          };
        };
      };
    };
    personalisation: {
      version?: string;
      shown: boolean;
      instruments?: {
        [key: number]: {
          order: number;
          method: string;
        };
      };
    };
  };
  CONTACT_DETAILS_PROCEED_CLICK: undefined;
  INSTRUMENTATION_SELECTION_SCREEN: {
    method: Method;
    block: Block;
    instruments: {
      [key: number]: {
        name: string;
        order: number;
      };
    };
  };
  METHOD_SELECTED: {
    block: Block;
    method: {
      name: string;
    };
  };
  INSTRUMENT_SELECTED: {
    block: Block;
    method: Method;
    instrument: Instrument;
  };
  USER_LOGGED_IN: {
    loginSource: LOGIN_SOURCE_TYPES;
    loginScreen?: string;
  };
}
interface RetryEventMap {
  RETRY_BUTTON: MethodAndInstrument;
  RETRY_CLICKED: MethodAndInstrument;
  AFTER_RETRY_SCREEN: {
    screenName: string;
    retryCount: number;
  };
  RETRY_VANISHED: MethodAndInstrument;
  PAYMENT_CANCELLED: MethodAndInstrument;
}
interface P13NEventMap {
  P13N_INITIATED: undefined;
  P13N_RESPONSE: {
    instruments: {
      [key: string]: {
        method: Method;
      };
    };
    versionID: string;
  };
  P13N_CALL_FAILED: {
    error: {
      category: string;
      description: string;
    };
  };
  P13N_SECTION: undefined;
  P13N_METHOD_SHOWN: {
    list: {
      [key: string]: {
        method: Method;
        instrument: Instrument;
      };
    };
  };
}

/*  adding different trackers for Misc , Retry and P13N for now becase we don't want to fire Retry
 and P13N as not verified by analytics team , will merge into one once verified by them */

export const MiscTracker = createTrackMethodForModule<MiscEventMap>(
  MiscEvents,
  { funnel: FUNNEL_NAMES.HIGH_LEVEL }
);
export const RetryTracker = createTrackMethodForModule<RetryEventMap>(
  RetryEvents,
  { skipEvents: true, funnel: FUNNEL_NAMES.HIGH_LEVEL }
);
export const P13NTracker = createTrackMethodForModule<P13NEventMap>(
  P13NEvents,
  { skipEvents: true, funnel: FUNNEL_NAMES.HIGH_LEVEL }
);
