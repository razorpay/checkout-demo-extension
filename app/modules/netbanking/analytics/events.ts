import { BEHAV, RENDER } from 'analytics-types';
import { createTrackMethodForModule, FUNNEL_NAMES } from 'analytics-v2';
import type { Instrument } from 'analytics-v2/types';

export const NetbankingEvents = {
  GEN_SHOWN: {
    name: 'gen_netbanking_shown',
    type: RENDER,
  },
  SELECTED: {
    name: 'netbanking_selected',
    type: BEHAV,
  },
  BANK_OPTIONS_SHOWN: {
    name: 'bank_options_shown',
    type: RENDER,
  },
  BANK_OPTION_SELECTED: {
    name: 'bank_option_selected',
    type: BEHAV,
  },
  P13N_SHOWN: {
    name: 'p13n_Netbanking_shown',
    type: RENDER,
  },
};

interface NetbankingEventMap {
  GEN_SHOWN: undefined;
  SELECTED:
    | string
    | {
        instrument: Instrument;
      };
  BANK_OPTIONS_SHOWN: {
    instruments: {
      [key: number]: {
        name: string;
        order: number;
      };
    };
  };
  BANK_OPTION_SELECTED: {
    name: string;
  };
  P13N_SHOWN: {
    instrument: Instrument;
  };
}

export const NetbankingTracker = createTrackMethodForModule<NetbankingEventMap>(
  NetbankingEvents,
  { skipEvents: true, funnel: FUNNEL_NAMES.NETBANKING }
);
