import {
  upiNrL0L1Improvements,
  oneClickUPIIntent as oneClickUPIIntentExperiment,
  upiQrOnL0,
  upiQrOnL1,
} from 'upi/experiments';
import { getOffersForTab } from 'checkoutframe/offers/index';
import {
  getMerchantOrder,
  getPreferences,
  isCustomerFeeBearer,
  isDynamicFeeBearer,
  isRecurring,
} from 'razorpay';
import { iOS, isBrave, isDesktop } from 'common/useragent';
import {
  googlePayUpiConfig,
  OTHER_INTENT_APPS,
  paytmUpiConfig,
  phonepeUpiConfig,
  QR_HOMESCREEN_AMOUNT_LIMIT,
  UPI_APPS,
} from 'upi/constants';
import {
  definePlatform,
  getDowntimeForUPIApp,
  isNativeIntentAvailable,
} from './helper/upi';
import { isUPIFlowEnabled } from 'checkoutstore/methods';
import {
  isInternational,
  hasFeature,
  getAmount,
  isOneClickCheckout,
} from 'razorpay';
import { updateRenderQrState } from './ui/components/QRWrapper/store';
import { getDowntimes } from 'checkoutframe/downtimes';
import { getMethodDowntimes } from 'checkoutframe/downtimes/methodDowntimes';
import { getUniqueValues } from 'utils/array';
import { capture, SEVERITY_LEVELS } from 'error-service';

//#region One Click UPI Intent
export function oneClickUPIIntent() {
  /**
   * disable experiment for fee bearer & UPI offer available
   */
  const offers = getOffersForTab('upi') || [];
  if (isCustomerFeeBearer() || offers.length > 0) {
    return false;
  }
  return oneClickUPIIntentExperiment.enabled();
}

//#endregion

//#region UPI Tiles
type EnableUPITilesReturnType = {
  status: boolean;
  variant: UPI.AppStackVariant;
  config: { apps: UPI.AppConfiguration[] };
};

export function enableUPITiles(
  validateL0ForSDK?: boolean
): EnableUPITilesReturnType {
  let response: EnableUPITilesReturnType = {
    status: false,
    config: { apps: [] },
    variant: 'subText',
  };
  // if UPI intent is disable hide intent from L0/L1
  if (
    !(
      getPreferences('methods.upi_intent') &&
      Boolean(getPreferences('methods.upi_type.intent', 1))
    )
  ) {
    return response;
  }

  if (
    isRecurring() ||
    !upiNrL0L1Improvements.enabled() ||
    (isBrave && iOS) ||
    definePlatform('mWebiOS')
  ) {
    return response;
  }
  const { name, config = {} } =
    getPreferences('feature_overrides.features')?.find(
      ({ name }: { name: string }) => name === 'enableUPITiles'
    ) || {};

  /**
   * using name as status as it will be undefined if feature not present in searched config
   */
  let variant: UPI.AppStackVariant = isDesktop() ? 'subText' : 'row';
  if (
    variant === 'row' &&
    validateL0ForSDK &&
    getRecommendedAppsForUPIStack(
      false,
      3,
      definePlatform('androidSDK') || definePlatform('iosSDK')
    ).length < 1
  ) {
    variant = 'subText';
  }

  response = {
    ...response,
    status: Boolean(name),
    variant,
    config,
  };

  return response;
}

/**
 *
 * @returns
 */
export function getRecommendedAppsForUPIStack(
  includeOthers = false,
  limit = 4,
  /**
   * This will impact the limit count as we will remove the unavailable applications
   * Meaning, we will pull recommended apps from list, validate and return reduced(if any) list
   */
  validateLimitedAppsWithSDK?: boolean
): Array<UPI.AppConfiguration> {
  const { config, status } = enableUPITiles();
  if (!status) {
    return [];
  }
  const appsFromAPI = config?.apps?.map(
    ({ shortcode }: { shortcode: string }) => shortcode
  );
  // Array.prototype.slice() returns a copy
  const recommended = UPI_APPS.preferred
    .reduce(
      (
        shortListed: Array<UPI.AppConfiguration>,
        currentApp: UPI.AppConfiguration
      ) => {
        if (appsFromAPI.includes(currentApp?.shortcode)) {
          shortListed.push(currentApp);
        }
        return shortListed;
      },
      []
    )
    .slice(0, limit);

  let recommendedAndUpdated = recommended;
  if (
    validateLimitedAppsWithSDK &&
    (definePlatform('androidSDK') || definePlatform('iosSDK'))
  ) {
    recommendedAndUpdated = recommended.filter(({ package_name }) =>
      isNativeIntentAvailable(package_name)
    );
  }

  if (includeOthers) {
    //  Array.prototype.splice() affects current instance
    recommendedAndUpdated.length < limit
      ? recommendedAndUpdated.push(OTHER_INTENT_APPS)
      : recommendedAndUpdated.splice(-1, 1, OTHER_INTENT_APPS);
  }

  return recommendedAndUpdated;
}

//#endregion

//#region QR V2

/**
 * Creates Base configuration for QR v2
 * on both Home and UPI Screens
 * with downtime handling
 */
export const initUpiQrV2 = () => {
  try {
    const upiHighDowntime = getMethodDowntimes()?.high.includes('upi');
    const top3AppsDown = [
      googlePayUpiConfig,
      phonepeUpiConfig,
      paytmUpiConfig,
    ].reduce((prevResp, app) => {
      return prevResp && getDowntimeForUPIApp(app).severe === 'high';
    }, true);

    const orderMethod = (getMerchantOrder() || {}).method;

    const status =
      isUPIFlowEnabled('qr') &&
      !isCustomerFeeBearer() &&
      !isDynamicFeeBearer() &&
      !isInternational() &&
      !upiHighDowntime &&
      !top3AppsDown;

    const homeScreenQR =
      status &&
      upiQrOnL0.enabled() &&
      !hasFeature('disable_homescreen_qr', false) &&
      Number(getAmount()) <= QR_HOMESCREEN_AMOUNT_LIMIT &&
      !orderMethod &&
      !isOneClickCheckout();

    const upiScreenQR =
      status &&
      upiQrOnL1.enabled() &&
      !isOneClickCheckout() &&
      !hasFeature('disable_upiscreen_qr', false) &&
      (!orderMethod || orderMethod === 'upi');

    const upiScreenQRPosition = (() => {
      if (upiScreenQR) {
        return !homeScreenQR ? 'top' : 'bottom';
      }
      return '';
    })();

    const upiDowntimes = getDowntimes().upi;

    const downtimePSPApps = getUniqueValues([
      ...upiDowntimes.high,
      ...upiDowntimes.medium,
      ...upiDowntimes.low,
    ]).reduce(
      (allDownApps: Array<string>, currentDowntime: Downtime.RawDowntime) => {
        if (
          currentDowntime &&
          currentDowntime.instrument &&
          currentDowntime.instrument.psp
        ) {
          allDownApps.push(currentDowntime.instrument.psp);
        }
        return allDownApps;
      },
      []
    );

    updateRenderQrState({
      status,
      homeScreenQR,
      upiScreenQR,
      upiScreenQRPosition,
      downtimePSPApps,
    });
  } catch (error) {
    capture(error as Error, {
      severity: SEVERITY_LEVELS.S1,
      unhandled: false,
    });
  }
};

//#endregion
