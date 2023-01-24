import { API, BEHAV, RENDER } from 'analytics-types';
import { createTrackMethodForModule, FUNNEL_NAMES } from 'analytics-v2';
import type { Instrument, Method } from 'analytics-v2/types';

export const CardsEvents = {
  NATIVE_OTP_SMS_RESEND_CLICKED: {
    name: 'native_otp_SMS_resend_clicked',
    type: BEHAV,
  },
  NATIVE_OTP_FILLED: {
    name: 'native_otp_filled',
    type: BEHAV,
  },
  NATIVE_OTP_SENT: {
    name: 'native_otp_sent',
    type: API,
  },
  NAME_ENTERED: {
    name: 'name_entered',
    type: BEHAV,
  },
  EXPIRY_ENTERED: {
    name: 'expiry_entered',
    type: BEHAV,
  },
  CARD_NUMBER_ENTERED: {
    name: 'card_number_entered',
    type: BEHAV,
  },
  ADD_NEW_CARD_SCREEN: {
    name: 'add_new_card_screen',
    type: RENDER,
  },
  SKIP_SAVED_CARD_CLICKED: {
    name: 'skip_saved_card_clicked',
    type: BEHAV,
  },
  CVV_FILLED: {
    name: 'cvv_filled',
    type: BEHAV,
  },
  SAVED_CARD_SCREEN: {
    name: 'saved_card_screen',
    type: RENDER,
  },
  HAS_SAVED_CARD: {
    name: 'has_saved_cards',
    type: API,
  },
  GEN_SHOWN: {
    name: 'gen_card_shown',
    type: RENDER,
  },
  SELECTED: {
    name: 'card_selected',
    type: BEHAV,
  },
  OTP_SENT: {
    name: 'otp_sent',
    type: API,
  },
  OTP_SCREEN: {
    name: 'otp_screen',
    type: RENDER,
  },
  SAVED_CARD_SELECTED: {
    name: 'saved_card_selected',
    type: BEHAV,
  },
  CARD_CONSENT_TOGGLED: {
    name: 'card_consent_toggled',
    type: BEHAV,
  },
  CONSENT_BOX_SHOWN: {
    name: 'consent_box_shown',
    type: RENDER,
  },
  OTP_ENTERED: {
    name: 'otp_entered',
    type: BEHAV,
  },
  P13N_SHOWN: {
    name: 'p13n_card_shown',
    type: RENDER,
  },
  RESEND_OTP_CLICKED: {
    name: 'resend_otp_clicked',
    type: BEHAV,
  },
  PAY_WITH_APPS_DISPLAYED: {
    name: 'pay_with_apps_displayed',
    type: RENDER,
  },
  PAY_WITH_APPS_PAYMENT_SELECTED: {
    name: 'pay_with_apps_payment_selected',
    type: BEHAV,
  },
  PAY_WITH_APPS_PAYMENT_INITIATED: {
    name: 'pay_with_apps_payment_initiated',
    type: BEHAV,
  },
  NATIVE_BANK_OTP_SCREEN: {
    name: 'native_bank_otp_screen',
    type: RENDER,
  },
  COMPLETE_ONBANKPAGE_CLICKED: {
    name: 'complete_onbankpage_clicked',
    type: BEHAV,
  },
};

interface CardsEventMap {
  NATIVE_OTP_SMS_RESEND_CLICKED: {
    instrument: Instrument;
  };

  NATIVE_OTP_FILLED: {
    method: Method;
    instrument: Instrument;
    flow: string;
  };
  NATIVE_OTP_SENT: {
    method: Method;
    instrument: Instrument;
    flow: string;
  };
  NAME_ENTERED: undefined;
  EXPIRY_ENTERED: undefined;
  CARD_NUMBER_ENTERED: undefined;
  ADD_NEW_CARD_SCREEN: undefined;
  SKIP_SAVED_CARD_CLICKED: undefined;
  CVV_FILLED: {
    for: string;
  };
  SAVED_CARD_SCREEN: {
    savedCards: number;
  };
  HAS_SAVED_CARD: {
    hasSavedCards: boolean;
  };
  GEN_SHOWN: undefined;
  SELECTED:
    | string
    | {
        instrument: Instrument;
      };
  CARD_CONSENT_TOGGLED: {
    instrument: {
      saveCardConsent: boolean;
    };
  };
  CONSENT_BOX_SHOWN: {
    instrument: {
      saveCardConsent: boolean;
    };
  };
  OTP_ENTERED: {
    for: string;
  };
  OTP_SCREEN: {
    for: string;
  };
  OTP_SENT: {
    for: string;
  };
  SAVED_CARD_SELECTED: {
    instrument: Instrument;
  };
  P13N_SHOWN: {
    instrument: Instrument;
  };
  RESEND_OTP_CLICKED: {
    for: string;
  };
  PAY_WITH_APPS_DISPLAYED: {
    instruments: Instrument[];
  };
  PAY_WITH_APPS_PAYMENT_SELECTED: {
    instrument: Instrument;
  };
  PAY_WITH_APPS_PAYMENT_INITIATED: {
    instrument: Instrument;
  };
  NATIVE_BANK_OTP_SCREEN: {
    flow: string;
  };
  COMPLETE_ONBANKPAGE_CLICKED: {
    flow: string;
  };
}

export const CardsTracker = createTrackMethodForModule<CardsEventMap>(
  CardsEvents,
  { skipEvents: true, funnel: FUNNEL_NAMES.CARD }
);
