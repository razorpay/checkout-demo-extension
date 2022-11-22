import { BEHAV, RENDER } from 'analytics-types';
import { createTrackMethodForModule, FUNNEL_NAMES } from 'analytics-v2';
import type { Instrument } from 'analytics-v2/types';

export const PaylaterEvents = {
  GEN_SHOWN: {
    name: 'paylater_shown',
    type: RENDER,
  },
  SELECTED: {
    name: 'paylater_selected',
    type: BEHAV,
  },
  APPS_SHOWN: {
    name: 'paylater_apps_shown',
    type: RENDER,
  },
  APP_SELECTED: {
    name: 'paylater_app_selected',
    type: BEHAV,
  },
};

interface PaylaterEventMap {
  GEN_SHOWN: undefined;
  SELECTED:
    | string
    | {
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
}

export const PaylaterTracker = createTrackMethodForModule<PaylaterEventMap>(
  PaylaterEvents,
  { skipEvents: true, funnel: FUNNEL_NAMES.PAYLATER }
);
