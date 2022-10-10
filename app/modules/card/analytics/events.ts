import { API, BEHAV, RENDER } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';
import type { Instrument } from 'analytics-v2/types';

export const CardsEvents = {
  GEN_NATIVE_OTP_NATIVE_TO_3DS_REDIRECT_CLICKED: {
    name: 'gen_native_otp_native_to_3DS_redirect_clicked',
    type: BEHAV,
  },
  GEN_NATIVE_OTP_SMS_RESEND_CLICKED: {
    name: 'gen_native_otp_SMS_resend_clicked',
    type: BEHAV,
  },
  GEN_NATIVE_OTP_FILLED: {
    name: 'gen_native_otp_filled',
    type: BEHAV,
  },
  GEN_NATIVE_OTP_SENT: {
    name: 'gen_native_otp_sent',
    type: API,
  },
  GEN_NAME_ENTERED: {
    name: 'gen_name_entered',
    type: BEHAV,
  },
  GEN_EXPIRY_ENTERED: {
    name: 'gen_expiry_entered',
    type: BEHAV,
  },
  GEN_CARD_NUMBER_ENTERED: {
    name: 'gen_card_number_entered',
    type: BEHAV,
  },
  GEN_ADD_NEW_CARD_SCREEN: {
    name: 'gen_add_new_card_screen',
    type: RENDER,
  },
  GEN_SKIP_SAVED_CARD_CLICKED: {
    name: 'gen_skip_saved_card_clicked',
    type: BEHAV,
  },
  GEN_CVV_FILLED: {
    name: 'gen_cvv_filled',
    type: BEHAV,
  },
  GEN_SAVED_CARD_SCREEN: {
    name: 'gen_saved_card_screen',
    type: RENDER,
  },
  HAS_SAVED_CARD: {
    name: 'has_saved_cards',
    type: API,
  },
  GEN_CARD_SHOWN: {
    name: 'gen_card_shown',
    type: RENDER,
  },
  GEN_CARD_SELECTED: {
    name: 'gen_card_selected',
    type: BEHAV,
  },
  GEN_OTP_SENT: {
    name: 'gen_otp_sent',
    type: API,
  },
  GEN_OTP_SCREEN: {
    name: 'gen_otp_sreen',
    type: RENDER,
  },
  GEN_SAVED_CARD_SELECTED: {
    name: 'gen_saved_card_selected',
    type: BEHAV,
  },
  GEN_CARD_CONSENT_TOGGLED: {
    name: 'gen_card_consent_toggled',
    type: BEHAV,
  },
  GEN_CONSENT_BOX_SHOWN: {
    name: 'gen_consent_box_shown',
    type: RENDER,
  },
  GEN_OTP_ENTERED: {
    name: 'gen_otp_entered',
    type: BEHAV,
  },
};

interface CardsEventMap {
  GEN_NATIVE_OTP_NATIVE_TO_3DS_REDIRECT_CLICKED: {
    instrument: Instrument;
  };
  GEN_NATIVE_OTP_SMS_RESEND_CLICKED: {
    instrument: Instrument;
  };

  GEN_NATIVE_OTP_FILLED: undefined;
  GEN_NATIVE_OTP_SENT: undefined;
  GEN_NAME_ENTERED: undefined;
  GEN_EXPIRY_ENTERED: undefined;
  GEN_CARD_NUMBER_ENTERED: undefined;
  GEN_ADD_NEW_CARD_SCREEN: undefined;
  GEN_SKIP_SAVED_CARD_CLICKED: undefined;
  GEN_CVV_FILLED: undefined;
  GEN_SAVED_CARD_SCREEN: {
    savedCards: number;
  };
  HAS_SAVED_CARD: {
    hasSavedCards: boolean;
  };
  GEN_CARD_SHOWN: undefined;
  GEN_CARD_SELECTED: undefined;
  GEN_SAVED_CARD_SELECTED: undefined;
  GEN_CARD_CONSENT_TOGGLED: {
    instrument: {
      saveCardConsent: boolean;
    };
  };
  GEN_CONSENT_BOX_SHOWN: {
    instrument: {
      saveCardConsent: boolean;
      screenName: string;
    };
  };
  GEN_OTP_ENTERED: undefined;
  GEN_OTP_SCREEN: undefined;
  GEN_OTP_SENT: undefined;
}

export const CardsTracker = createTrackMethodForModule<CardsEventMap>(
  CardsEvents,
  { skipEvents: true }
);
