import { RENDER } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';

export const MiscEvents = {
  OPEN: { name: 'checkout_open', type: RENDER },
};

interface MiscEventMap {
  OPEN: {
    user: {
      contact: {
        hidden: boolean;
        prefill: string;
        value: string;
      };
      email: {
        hidden: boolean;
        prefill: string;
        value: string;
      };
    };
  };
}

export const MiscTracker = createTrackMethodForModule<
  MiscEventMap,
  typeof MiscEvents
>(MiscEvents);
