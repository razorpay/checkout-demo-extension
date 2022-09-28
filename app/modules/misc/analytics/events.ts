import { BEHAV, INTEGRATION, RENDER } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';
import type { Block } from 'analytics-v2/types';
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
    method: {
      name: string;
    };
    block: Block;
    instruments: {
      [key: number]: {
        order: number;
        method: string;
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
    method: {
      name: string;
    };
    instrument: {
      name?: string;
      saved: boolean;
      personalisation: boolean;
      network?: string;
      issuer?: string;
      type?: string;
    };
  };
  USER_LOGGED_IN: {
    loginSource: LOGIN_SOURCE_TYPES;
    loginScreen?: string;
  };
}

export const MiscTracker = createTrackMethodForModule<MiscEventMap>(MiscEvents);
