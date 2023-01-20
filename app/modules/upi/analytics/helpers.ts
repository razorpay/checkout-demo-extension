// Analytics imports
import { Events } from 'analytics';
import UPI_EVENTS from 'ui/tabs/upi/events';
import { UPITracker } from 'upi/analytics/events';
import type { OtherAppsLoadEvent } from 'upi/analytics/types';
import { AnalyticsV2State } from 'analytics-v2';

// helper imports
import { getLastUpiUxErroredPaymentApp } from 'upi/helper/upiUx';
import { upiUxV1dot1 } from 'upi/experiments';
import { getOtherAppsLabel } from 'common/upi';
import { triggerInstAnalytics } from 'home/analytics/helpers';
import { getInstrumentDetails } from 'ui/tabs/home/helpers';
import { OTHER_INTENT_APPS } from 'upi/constants';
import type { InstrumentType } from 'home/analytics/types';

/**
 * trigger the analytics events during onload of other_apps screen loaded.
 * @param {UPI.AppConfiguration[]} showableApps
 */
export const triggerAnalyticsOnLoad = (
  showableApps: UPI.AppConfiguration[]
) => {
  let listedApps: string[] = [];
  if (showableApps) {
    listedApps = showableApps.map((appData) => appData.shortcode);
    listedApps.push(getOtherAppsLabel(showableApps));
  }
  Events.TrackRender(UPI_EVENTS.INTENT_APPS_LOAD, { listed_app: listedApps });
  Events.TrackRender(UPI_EVENTS.INTENT_APPS_LOAD_V2);
  let { shortcode } = {} as UPI.AppConfiguration;
  if (upiUxV1dot1.enabled()) {
    ({ shortcode } = getLastUpiUxErroredPaymentApp('automatic'));
  }
  let eventPayload = {
    trigger_source: shortcode ? `${shortcode}_fail` : 'click_on_others',
  };
  if (listedApps?.length) {
    eventPayload = {
      ...eventPayload,
      instrument: listedApps.map((appName) => ({
        name: appName,
      })),
    } as OtherAppsLoadEvent;
  }
  const { instrument } = AnalyticsV2State.selectedInstrumentForPayment;

  if (instrument?.name === OTHER_INTENT_APPS.app_name) {
    UPITracker.UPI_OTHER_APPS_SCREEN_LOADED(eventPayload);
  }
};

/**
 * trigger the analytics events of UPI apps during on screen loading.
 * @param {UPI.AppConfiguration[][]} rowCol
 * @param {String} screen
 */
export const trackUPIAppsShown = (
  rowCol: UPI.AppConfiguration[][],
  screen: string
) => {
  const instrumentList = rowCol
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ?.flat()
    ?.map(({ shortcode }: UPI.AppConfiguration) => ({
      name: shortcode,
    }));
  const eventPayload = instrumentList?.length
    ? { instrument: instrumentList }
    : {};
  // for L0 screen we are sending the event with section prefix and L1 screen we are sending the section in meta
  screen === ''
    ? UPITracker.GEN_UPI_APPS_SHOWN(eventPayload)
    : UPITracker.UPI_APPS_SHOWN(eventPayload);
};

export const trackUPIAppSelect = (
  instrument: InstrumentType,
  appName: string
) => {
  try {
    const instrumentData = {
      ...instrument,
      apps: [appName],
    };
    if (appName !== OTHER_INTENT_APPS.app_name) {
      triggerInstAnalytics(instrumentData);
    } else {
      AnalyticsV2State.selectedInstrumentForPayment = {
        method: { name: instrumentData.method },
        instrument: getInstrumentDetails(instrumentData),
      };
    }
  } catch {}
};
