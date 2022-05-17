import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import type { CustomObject } from 'types';
import { qrState } from 'upi/ui/components/QR/store';
import { get } from 'svelte/store';
import { TRACES, EVENTS } from './constants';

const upiTrackerPayload: {
  appForPay?: UPI.UpiAppForPay; // App chosen to pay
  response?: any; // response of intent => fail keyword for failed payments
  features: Common.Object<string>; // what all the features are enabled on UPI at present
  variant?: UPI.AppStackVariant; // variant of feature; row/subtext
  platform: string | null; // mweb/sdk of ios or android and desktop
  actionsAvailable?: UPI.AppTileAction[]; // possible flows for platform
  action?: UPI.AppTileAction; // flow triggered
  trace: Common.Object<string | object>; // user behavior with timestamp
  events: {
    // specific to iOS
    beforeReset: Common.Object<string[]>; // events (focus/blur) raised before reset execution
    afterReset: Common.Object<string[]>; // events (focus/blur) raised after reset execution
  };
  reason?: string | object; // reason of event/instance
} = {
  features: {},
  trace: {},
  platform: null,
  events: {
    beforeReset: {},
    afterReset: {},
  },
};

export const captureFeature = (feature: string, config: any) => {
  if (!feature) {
    return;
  }
  const key = `UPI_FEATURE:${feature.toUpperCase()}`;
  upiTrackerPayload.features[key] = config || true;
  Analytics.setMeta(key, true);
};

/**
 * This is to recreate the user journey in any errors or SR/CR dips
 * @param step
 */
export const captureTrace = (step: string, data?: any) => {
  upiTrackerPayload.trace[Date.now()] = data
    ? {
        step,
        data,
      }
    : step;
};

export const storeUpiPopupEvents = (
  child: string[],
  parent: string[],
  beforeReset?: boolean
) => {
  if (beforeReset) {
    upiTrackerPayload.events.beforeReset = {
      child,
      parent,
    };
  } else {
    upiTrackerPayload.events.afterReset = {
      child,
      parent,
    };
  }
};

export const storePlatformForTracker = (
  platform: string | null,
  actions: UPI.AppTileAction[]
) => {
  upiTrackerPayload.platform = platform;
  upiTrackerPayload.actionsAvailable = actions;
};

export const storeActionForTracker = (action: UPI.AppTileAction) => {
  captureTrace(`${TRACES.ACTION_TRIGGERED}:${action}`);
  upiTrackerPayload.action = action;
};

export const baseTracker = (
  eventName: string,
  immediately = false
) => {
  Analytics.track(`UPI:${eventName}`, {
    data: upiTrackerPayload,
    immediately,
  });
};

export const trackOtherSelection = (variant: UPI.AppStackVariant) => {
  captureTrace(TRACES.OTHERS_SELECTED);
  upiTrackerPayload.variant = variant;
  baseTracker(EVENTS.OTHERS_SELECTED, true);
};

export const trackNoFlowAppSelection = (appForPay: UPI.UpiAppForPay) => {
  captureTrace(TRACES.APP_FLOW_ABSENT_FALLBACK_OTHERS);
  upiTrackerPayload.appForPay = appForPay;
  baseTracker(EVENTS.APP_FLOW_ABSENT_FALLBACK_OTHERS, true);
};

export const trackAppSelection = (appForPay: UPI.UpiAppForPay) => {
  captureTrace(TRACES.APP_SELECTED);
  upiTrackerPayload.appForPay = appForPay;
  baseTracker(EVENTS.APP_SELECTED, true);
};

export const trackUserCancelOniOSMweb = () => {
  upiTrackerPayload.response = 'fail';
  upiTrackerPayload.reason = 'MANUAL USER CANCEL';
  baseTracker(EVENTS.USER_CANCEL_ON_IOS_MWEB, true);
};

export const trackTabDestroyOniOSMWeb = (forceClose: boolean) => {
  if (forceClose) {
    captureTrace(TRACES.IOS_MWEB_TAB_FORCE_DESTROY_CALLED);
  } else {
    captureTrace(TRACES.IOS_MWEB_TAB_DESTROY_CALLED);
  }
  baseTracker(EVENTS.TAB_DESTROY_ON_IOS_MWEB, true);
};

export const trackIntentFailure = (reason: object | string) => {
  upiTrackerPayload.reason = reason;
  upiTrackerPayload.response = 'fail';
  baseTracker(EVENTS.INTENT_FAILED, true);
};

let qrAnalyticsPayload: CustomObject<number | string> = {};

export const trackQRStatus = (
  type: 'paymentInitiation' | 'paymentResponse' | 'qrLoaded' | 'qrExpired'
) => {
  switch (type) {
    case 'paymentInitiation':
    case 'paymentResponse':
      qrAnalyticsPayload[type] = Date.now();
      break;
    case 'qrLoaded':
      qrAnalyticsPayload[type] = Date.now();
      Analytics.track(EVENTS.QR_ON_L1, {
        type: AnalyticsTypes.RENDER,
        data: {
          ...qrAnalyticsPayload,
          ...get(qrState),
        },
      });
      break;
    case 'qrExpired':
      qrAnalyticsPayload[type] = Date.now();
      Analytics.track(EVENTS.QR_ON_L1_EXPIRED, {
        type: AnalyticsTypes.RENDER,
        data: {
          ...qrAnalyticsPayload,
          ...get(qrState),
        },
      });
  }
};

export const trackRefreshQR = () => {
  qrAnalyticsPayload = {};
  Analytics.track(EVENTS.REFRESH_QR_ON_L1, {
    type: AnalyticsTypes.BEHAV,
  });
};
