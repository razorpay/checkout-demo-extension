import { BEHAV, RENDER, API } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';
import type { Instrument } from 'analytics-v2/types';

// TODO: During initialization, the event should accept the defaultData for payload.
export const UPIEvents = {
  GEN_SHOWN: {
    name: 'gen_UPI_shown',
    type: RENDER,
  },
  SELECTED: {
    name: 'UPI_selected',
    type: BEHAV,
  },
  UPI_L1_LOADED: {
    name: 'UPI_L1_loaded',
    type: RENDER,
  },
  COLLECT_VPA_SELECTED: {
    name: 'collect_VPA_selected',
    type: BEHAV,
  },
  VPA_FILLED: {
    name: 'VPA_filled',
    type: BEHAV,
  },
  VPA_VERIFICATION_STARTED: {
    name: 'VPA_verification_started',
    type: API,
  },
  VPA_VERIFICATION_ENDED: {
    name: 'VPA_verification_ended',
    type: API,
  },
  SHOW_QR_CLICKED: {
    name: 'show_QR_clicked',
    type: BEHAV,
  },
  QR_GENERATED: {
    name: 'QR_generated',
    type: API,
  },
  UPI_APPS_SHOWN: {
    name: 'UPI_apps_shown',
    type: RENDER,
  },
  UPI_APP_SELECTED: {
    name: 'UPI_app_selected',
    type: BEHAV,
  },
  UPI_OTHERS_SELECTED: {
    name: 'UPI_others_selected',
    type: BEHAV,
  },
  UPI_OTHER_APPS_SCREEN_LOADED: {
    name: 'UPI_other_apps_screen_loaded',
    type: RENDER,
  },
  PAY_WITH_OTHER_APPS_SELECTED: {
    name: 'pay_with_other_apps_selected',
    type: BEHAV,
  },
  P13N_SHOWN: {
    name: 'p13n_UPI_apps_shown',
    type: RENDER,
  },
};

interface UPIEventMap {
  GEN_SHOWN: undefined;
  SELECTED:
    | string
    | {
        instrument: Instrument;
      };
  UPI_L1_LOADED: undefined;
  COLLECT_VPA_SELECTED: undefined;
  VPA_FILLED: undefined;
  VPA_VERIFICATION_STARTED: undefined;
  VPA_VERIFICATION_ENDED: {
    response: Record<string, any>;
  };
  UPI_APPS_SHOWN: {
    screen: string;
    instrument?: Instrument[];
  };
  UPI_APP_SELECTED: {
    screen: string;
    instrument: Instrument;
  };
  UPI_OTHERS_SELECTED: undefined;
  UPI_OTHER_APPS_SCREEN_LOADED: {
    trigger_source: string;
    instrument?: Instrument[];
  };
  PAY_WITH_OTHER_APPS_SELECTED: undefined;
  SHOW_QR_CLICKED: undefined;
  QR_GENERATED: undefined;
  P13N_SHOWN: {
    instrument: Instrument;
  };
}

export const UPITracker = createTrackMethodForModule<UPIEventMap>(UPIEvents, {
  skipEvents: true,
});
