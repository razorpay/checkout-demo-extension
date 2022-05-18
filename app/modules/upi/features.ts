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
import { definePlatform } from './helper/upi';
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

export function enableUPITiles(): EnableUPITilesReturnType {
  let response: EnableUPITilesReturnType = {
    status: false,
    config: { apps: [] },
    variant: 'subText',
  };

  if (
    isRecurring() ||
    !upiNrL0L1Improvements.enabled() ||
    (isBrave && iOS) ||
    definePlatform('mWebiOS')
  ) {
    return response;
  } else {
    const { name, config = {} } =
      getPreferences('feature_overrides.features')?.find(
        ({ name }: { name: string }) => name === 'enableUPITiles'
      ) || {};

    /**
     * using name as status as it will be undefined if feature not present in searched config
     */
    response = {
      ...response,
      status: Boolean(name),
      variant: isDesktop() ? 'subText' : 'row',
      config,
    };
  }
  return response;
}

/**
 *
 * @returns
 */
export function getRecommendedAppsForUPIStack(
  includeOthers = false,
  limit = 4
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

  if (includeOthers) {
    //  Array.prototype.splice() affects current instance
    recommended.length < limit
      ? recommended.push(OTHER_INTENT_APPS)
      : recommended.splice(-1, 1, OTHER_INTENT_APPS);
  }

  return recommended;
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