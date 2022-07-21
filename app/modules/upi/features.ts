import {
  upiNrL0L1Improvements,
  upiQrOnL1,
  oneClickUPIIntent as oneClickUPIIntentExperiment,
} from 'upi/experiments';
import { getOffersForTab } from 'checkoutframe/offers/index';
import {
  getPreferences,
  isCustomerFeeBearer,
  isDynamicFeeBearer,
  isRecurring,
} from 'razorpay';
import { iOS, isBrave, isDesktop } from 'common/useragent';
import { OTHER_INTENT_APPS, UPI_APPS } from 'upi/constants';
import { definePlatform, isNativeIntentAvailable } from './helper/upi';
import { isUPIFlowEnabled } from 'checkoutstore/methods';
import { isInternational, hasFeature } from 'razorpay';

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
 * Entry Point for UpiQrV2
 * i.e, Auto-generated timer based Qr
 * @returns
 */
export const enableUpiQrV2 = () => {
  if (!upiQrOnL1.enabled()) {
    return false;
  }
  return (
    !hasFeature('disable_l1_qr', false) &&
    !isInternational() &&
    isUPIFlowEnabled('qr') &&
    !isCustomerFeeBearer() &&
    !isDynamicFeeBearer()
  );
};
//#endregion
