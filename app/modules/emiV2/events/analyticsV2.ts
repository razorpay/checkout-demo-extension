import { BEHAV, RENDER } from 'analytics-types';
import { createTrackMethodForModule, FUNNEL_NAMES } from 'analytics-v2';
import type { Instrument } from 'analytics-v2/types';

export const EMIEvents = {
  GEN_SHOWN: {
    name: 'gen_EMI_shown',
    type: RENDER,
  },
  SELECTED: {
    name: 'EMI_selected',
    type: BEHAV,
  },
  EMI_PROVIDER_SELECTED: {
    name: 'EMI_provider_selected',
    type: BEHAV,
  },
  EMI_PROVIDERS_SHOWN: {
    name: 'EMI_providers_shown',
    type: RENDER,
  },
};

interface EMIEventMap {
  GEN_SHOWN: undefined;
  SELECTED:
    | string
    | {
        instrument: Instrument;
      };
  EMI_PROVIDERS_SHOWN: {
    bank?: Instrument[];
    other?: Instrument[];
  };
  EMI_PROVIDER_SELECTED: { instrument: Instrument };
}

export const EMITracker = createTrackMethodForModule<EMIEventMap>(EMIEvents, {
  skipEvents: true,
  funnel: FUNNEL_NAMES.EMI,
});
