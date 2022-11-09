// Analytics imports
import { Events } from 'analytics';
import UPI_EVENTS from 'ui/tabs/upi/events';
import { UPITracker } from 'upi/analytics/events';
import type { OtherAppsLoadEvent } from 'upi/analytics/types';

// helper imports
import { getLastUpiUxErroredPaymentApp } from 'upi/helper/upiUx';
import { upiUxV1dot1 } from 'upi/experiments';
import { getOtherAppsLabel } from 'common/upi';
import { getCurrentScreen } from 'home/analytics/helpers';

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
  UPITracker.UPI_OTHER_APPS_SCREEN_LOADED(eventPayload);
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
  const eventProperties = {
    screen: getCurrentScreen(screen),
  };
  const eventPayload = instrumentList?.length
    ? { ...eventProperties, instrument: instrumentList }
    : eventProperties;
  UPITracker.UPI_APPS_SHOWN(eventPayload);
};
