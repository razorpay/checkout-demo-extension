import { API, BEHAV, RENDER } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';
import type { Instrument, MethodAndInstrument } from 'analytics-v2/types';

export const WalletEvents = {
  GEN_SHOWN: {
    name: 'gen_wallet_shown',
    type: RENDER,
  },
  SELECTED: {
    name: 'wallet_selected',
    type: BEHAV,
  },
  P13N_SHOWN: {
    name: 'p13n_wallet_shown',
    type: RENDER,
  },
  APPS_SHOWN: {
    name: 'wallet_apps_shown',
    type: RENDER,
  },
  APP_SELECTED: {
    name: 'wallet_app_selected',
    type: BEHAV,
  },
  NATIVE_OTP_SENT: {
    name: 'native_otp_sent',
    type: API,
  },
  NATIVE_OTP_FILLED: {
    name: 'native_otp_filled',
    type: BEHAV,
  },
  OTP_SCREEN_LOADED: {
    name: 'otp_screen_loaded',
    type: RENDER,
  },
  OTP_SUBMITTED: {
    name: 'wallet_otp_submitted',
    type: BEHAV,
  },
};

interface WalletEventMap {
  GEN_SHOWN: undefined;
  SELECTED:
    | string
    | {
        instrument: Instrument;
      };
  P13N_SHOWN: {
    instrument: Instrument;
  };
  APPS_SHOWN: {
    instruments: {
      [key: number]: {
        name: string;
        order: number;
      };
    };
  };
  APP_SELECTED: {
    instrument: {
      name: string;
    };
  };
  NATIVE_OTP_SENT: MethodAndInstrument;
  NATIVE_OTP_FILLED: MethodAndInstrument;
  OTP_SCREEN_LOADED: MethodAndInstrument;
  OTP_SUBMITTED: MethodAndInstrument;
}

export const WalletTracker = createTrackMethodForModule<WalletEventMap>(
  WalletEvents,
  { skipEvents: true }
);
