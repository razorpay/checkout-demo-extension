import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import type { CustomObject } from 'types';
import { qrState } from 'upi/ui/components/QR/store';
import { get } from 'svelte/store';
import { TRACES, EVENTS } from './constants';

function getScreenFromParent(parent: UPI.QRParent) {
  return parent === 'homeScreen' ? 'L0' : 'L1';
}

const upiTrackerPayload: {
  appForPay?: UPI.UpiAppForPay; // App chosen to pay
  response?: any; // response of intent => fail keyword for failed payments
  features: Common.Object<string>; // what all the features are enabled on UPI at present
  variant?: UPI.AppStackVariant; // variant of feature; row/subtext
  platform: string | null; // mweb/sdk of ios or android and desktop
  actionsAvailable?: UPI.AppTileAction[]; // possible flows for platform
  action?: UPI.AppTileAction; // flow triggered
  events: {
    // specific to iOS
    beforeReset: Common.Object<string[]>; // events (focus/blur) raised before reset execution
    afterReset: Common.Object<string[]>; // events (focus/blur) raised after reset execution
  };
  reason?: string | object; // reason of event/instance
} = {
  features: {},
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
export const trackTrace = (step: string, data?: object | undefined) => {
  baseTracker(step, true, data);
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
  trackTrace(`${TRACES.ACTION_TRIGGERED}:${action}`);
  upiTrackerPayload.action = action;
};

export const baseTracker = (
  eventName: string,
  immediately = false,
  payload?: object
) => {
  Analytics.track(`UPI:${eventName}`, {
    data: {
      ...(payload || upiTrackerPayload),
      timestamp: Date.now(),
    },
    immediately,
  });
};

export const trackOtherSelection = (variant: UPI.AppStackVariant) => {
  upiTrackerPayload.variant = variant;
  baseTracker(EVENTS.OTHERS_SELECTED, true);
};

export const trackNoFlowAppSelection = (appForPay: UPI.UpiAppForPay) => {
  upiTrackerPayload.appForPay = appForPay;
  baseTracker(EVENTS.APP_FLOW_ABSENT_FALLBACK_OTHERS, true);
};

export const trackAppSelection = (appForPay: UPI.UpiAppForPay) => {
  upiTrackerPayload.appForPay = appForPay;
  baseTracker(EVENTS.APP_SELECTED, true);
};

export const trackUserCancelOniOSMweb = () => {
  upiTrackerPayload.response = 'fail';
  upiTrackerPayload.reason = 'MANUAL USER CANCEL';
  baseTracker(EVENTS.USER_CANCEL_ON_IOS_MWEB, true);
};

export const trackTabDestroyOniOSMWeb = (forceClose: boolean) => {
  baseTracker(EVENTS.TAB_DESTROY_ON_IOS_MWEB, true, {
    forceClose,
  });
};

export const trackIntentFailure = (reason: object | string) => {
  upiTrackerPayload.reason = reason;
  upiTrackerPayload.response = 'fail';
  baseTracker(EVENTS.INTENT_FAILED, true);
};

let qrAnalyticsPayload: CustomObject<number | string> = {};

function getQRCTA() {
  const QRStateData = get(qrState);
  return QRStateData.autoGenerate ? 'SHOW' : 'REFRESH';
}

export const trackQRStatus = (
  type: 'paymentInitiation' | 'paymentResponse' | 'qrLoaded' | 'qrExpired',
  parentState: UPI.QRParent
) => {
  const parent = getScreenFromParent(parentState);
  const QRStateData = get(qrState);
  const CTA = QRStateData.autoGenerate ? 'SHOW' : 'REFRESH';
  switch (type) {
    case 'paymentInitiation':
    case 'paymentResponse':
      qrAnalyticsPayload[type] = Date.now();
      break;
    case 'qrLoaded':
      qrAnalyticsPayload[type] = Date.now();
      Analytics.track(EVENTS.QR_RENDERED, {
        type: AnalyticsTypes.RENDER,
        data: {
          ...qrAnalyticsPayload,
          ...QRStateData,
          CTA,
          parent,
        },
      });
      break;
    case 'qrExpired':
      qrAnalyticsPayload[type] = Date.now();
      Analytics.track(EVENTS.QR_EXPIRED, {
        type: AnalyticsTypes.RENDER,
        data: {
          ...qrAnalyticsPayload,
          ...QRStateData,
          CTA,
          parent,
        },
      });
  }
};

export const trackQRGenerate = (parent: UPI.QRParent) => {
  qrAnalyticsPayload = {};
  Analytics.track(EVENTS.QR_CTA_CLICK, {
    type: AnalyticsTypes.BEHAV,
    data: {
      parent: getScreenFromParent(parent),
      CTA: getQRCTA(),
    },
  });
};

export const renderQRSection = (parent: UPI.QRParent) => {
  qrAnalyticsPayload = {};
  Analytics.track(EVENTS.QR_SECTION_RENDERED, {
    type: AnalyticsTypes.RENDER,
    data: {
      parent: getScreenFromParent(parent),
      CTA: getQRCTA(),
    },
  });
};
