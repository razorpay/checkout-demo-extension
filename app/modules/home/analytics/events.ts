import { BEHAV } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';
import type { Method } from 'analytics-v2/types';

export const HomeEvents = {
  PREFILL_SECTION_SELECTED: {
    name: 'prefill_section_selected',
    type: BEHAV,
  },
};

interface HomeEventsMap {
  PREFILL_SECTION_SELECTED: {
    method: Method;
  };
}

export const HomeTracker = createTrackMethodForModule<HomeEventsMap>(
  HomeEvents,
  { skipEvents: true }
);
