import { isUPIFlowEnabled } from 'checkoutstore/methods';
import { getSDKMeta, getUPIIntentApps } from 'checkoutstore/native';
import { isWebPaymentsApiAvailable } from 'common/webPaymentsApi';
import { android, iOS, isDesktop } from 'common/useragent';
import { OTHER_INTENT_APPS } from 'upi/constants';
import { checkDowntime, getDowntimes } from 'checkoutframe/downtimes';
import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { get } from 'svelte/store';
import { storePlatformForTracker } from 'upi/events/trackers';

/**
 * Priority Order is very important
 */
const platformActionMap: Common.KeyObject<UPI.Platform, UPI.AppTileAction[]> = {
  androidSDK: ['nativeIntent', 'none'],
  mWebAndroid: ['paymentRequestAPI', 'deepLinkIntent', 'none'],
  iosSDK: ['nativeIntent', 'none'],
  mWebiOS: ['deepLinkIntent', 'none'],
  desktop: ['none'],
};

export const definePlatform = (platform: UPI.Platform): boolean => {
  const sdkMeta = getSDKMeta();
  switch (platform) {
    case 'mWebAndroid':
      return sdkMeta.platform === 'web' && android;
    case 'mWebiOS':
      return sdkMeta.platform === 'web' && iOS;
    case 'androidSDK':
      return sdkMeta?.platform === 'android';
    case 'iosSDK':
      return sdkMeta?.platform === 'ios';
    case 'desktop':
    default:
      return isDesktop();
  }
};
/**
 * this functions will be called with app package_name,
 * hence bind/create dummy functions to avoid param miss-match
 */
const actionQualifier: Common.KeyObject<
  UPI.AppTileAction,
  ((...args: any[]) => void)[]
> = {
  nativeIntent: [
    isUPIFlowEnabled.bind(null, 'intent'),
    (packageName: string) =>
      getUPIIntentApps().filtered.findIndex(
        (app: any) => app.package_name === packageName
      ) > -1,
  ],
  deepLinkIntent: [isUPIFlowEnabled.bind(null, 'intentUrl')],
  paymentRequestAPI: [isWebPaymentsApiAvailable],
  none: [],
};

/**
 *
 * This method is a closure based, must be called to set the platform and its functions
 * On first call it will return closure context method that has access to platform and flows allowed
 * That returned method when called with app config, will search for possible method for the app chosen
 * And returns the flow
 * @returns (
  app: UPI.AppConfiguration
) => UPI.AppTileAction
 */
export function definePlatformReturnMethodIdentifier(): (
  app: UPI.AppConfiguration
) => UPI.AppTileAction {
  const [platform, actionOrder] = Object.entries(platformActionMap).find(
    ([platformName, _]) => definePlatform(platformName as UPI.Platform)
  ) || [null, []];
  storePlatformForTracker(platform, actionOrder);
  return function (app: UPI.AppConfiguration) {
    const { package_name, shortcode } = app;
    if (shortcode === OTHER_INTENT_APPS.shortcode) {
      return 'none';
    }
    return actionOrder?.find((action: UPI.AppTileAction) =>
      (actionQualifier as any)[action].reduce(
        (
          result: boolean,
          currentFunction: (packageName: string) => boolean
        ) => {
          return result && currentFunction(package_name);
        },
        true
      )
    ) as UPI.AppTileAction;
  };
}

export function getDowntimeForUPIApp(
  app: UPI.AppConfiguration,
  normalize = false
) {
  const response: Downtime.Config = {
    downtimeInstrument: app.shortcode,
    severe: '',
  };
  const upiDowntimes = getDowntimes()?.upi;

  const currentDowntime = checkDowntime(upiDowntimes, 'psp', app.shortcode);
  if (currentDowntime) {
    response.severe = currentDowntime as Downtime.Config['severe'];
    /**
     * Based on the product decision to reduce downtime to medium
     */
    if (response.severe === 'high' && normalize) {
      response.severe = 'medium';
    }
  }
  return response;
}

export const resetCallbackOnUPIAppForPay = () => {
  const selectedUPIApp = get(selectedUPIAppForPay);
  if (selectedUPIApp.callbackOnPay) {
    selectedUPIAppForPay.set({
      ...selectedUPIApp,
      callbackOnPay: undefined,
    });
  }
};

export function avoidSessionSubmit() {
  const selectedUPIApp = get(selectedUPIAppForPay);
  if (typeof selectedUPIApp.callbackOnPay === 'function') {
    /**
     * Possibly UPI-App-tile action is waiting for additional confirmation
     * Just call the function but don't reset the function as user can click on backdrop and click on pay again
     */
    selectedUPIApp.callbackOnPay();
    return true;
  }
}

/**
 * @param {number} maxInRow
 * @param {any[]} items
 * @returns items arranged in with given items in rows with maxInRow count
 * ex: 7, 4 return 2D array with
 * [
 *  [ 1 2 3 4]
 *  [ 5 6 7 ]
 * ]
 *
 *
 */
export const getGridArray = <T>(maxInRow = 0, items: T[] = []) => {
  return Array.from(new Array(Math.ceil(items.length / maxInRow))).map((_, i) =>
    items.slice(i * maxInRow, (i + 1) * maxInRow)
  );
};

export const isNativeIntentAvailable = (packageName: string) => {
  return getUPIIntentApps().filtered.some(
    (deviceApp: { package_name: string }) =>
      deviceApp.package_name === packageName
  );
};
