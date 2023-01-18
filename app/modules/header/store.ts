import { getCardOffer } from 'checkoutframe/offers';
import { isMobileStore, screenStore, showBottomElement } from 'checkoutstore';
import { getTPV } from 'checkoutstore/methods';
import { country, homeView } from 'checkoutstore/screens/home';
import { INDIA_COUNTRY_CODE } from 'common/constants';
import {
  isMediumScreen,
  UCBrowser,
  isMIBrowser,
  iOS,
  iosWebView,
} from 'common/useragent';
import {
  getMerchantOffers,
  getOption,
  isAddressEnabled,
  isContactHidden,
  isEmailHidden,
  isOfferForced,
  isPartialPayment,
} from 'razorpay';
import { derived, get, writable } from 'svelte/store';
import { HOME_VIEWS } from 'ui/tabs/home/constants';

export enum HEADER_SIZE {
  MINIMAL,
  FULL_SCREEN,
  MEDIUM,
}

/**
 * It will be set true when any field from Field component is touched/focused.
 */
export const anyFieldTouched = writable(false);

/**
 * Used to store body height
 */
export const bodyHeight = writable<number>(0);

export const headerVisible = writable(true);

export const fullScreenHeader = derived(
  [screenStore, homeView, isMobileStore, anyFieldTouched, bodyHeight],
  (
    [$screenStore, $homeView, $isMobileStore, $anyFieldTouched, $bodyHeight],
    set
  ) => {
    const showFullScreen =
      $screenStore === '' &&
      $homeView === HOME_VIEWS.DETAILS &&
      getContactScreenInputCount() <= 2;
    if (
      (($anyFieldTouched || iOS || iosWebView) && $isMobileStore) ||
      $bodyHeight > (isMediumScreen() ? 300 : 340) ||
      UCBrowser ||
      isMIBrowser
    ) {
      showBottomElement.set(true);
      set(
        showFullScreen && $bodyHeight < 475
          ? HEADER_SIZE.MEDIUM
          : HEADER_SIZE.MINIMAL
      );
    } else {
      const showBottom = computeShowBottomElementThatImpactHeader();
      let headerSize = HEADER_SIZE.FULL_SCREEN;
      if (showBottom.total && showFullScreen) {
        showBottomElement.set(showFullScreen ? showBottom.show : true);
        headerSize =
          showBottom.isOnlyTimeoutVisible || showBottom.total === 1
            ? HEADER_SIZE.FULL_SCREEN
            : HEADER_SIZE.MEDIUM;
      }
      set(showFullScreen ? headerSize : HEADER_SIZE.MINIMAL);
    }
  }
);

/**
 * computeShowBottomElementThatImpactHeader function compute the edge cases which impact Header in contact detail screen
 * This function is called when you see full screen header.
 * Edge cases computed by this function are
 * 1. TPV case
 * 2. Timeout
 * 3. Forced offer
 * 4. Offers
 *
 * It compute how many edge cases available at a time.
 * Also compute only timeout is visible in screen
 * As both timeout and normal offers will be shown at bottom whereas other can be seen as part of header
 * @returns {Object}
 */
export function computeShowBottomElementThatImpactHeader() {
  const tpv = getTPV();
  const isTimeoutEnabled = Number(Boolean(getOption('timeout') || 0));
  const isNotForcedOffers = Number(
    !isOfferForced() ? Boolean(getMerchantOffers()?.length) : 0
  );
  const totalElementInBottomImpactHeader =
    isTimeoutEnabled +
    Number(isOfferForced() && Boolean(getCardOffer())) +
    isNotForcedOffers +
    Number(Boolean(tpv && !tpv.invalid));

  return {
    total: totalElementInBottomImpactHeader,
    show:
      totalElementInBottomImpactHeader > 1 ||
      Boolean(
        totalElementInBottomImpactHeader === 1 &&
          (isTimeoutEnabled || isNotForcedOffers)
      ),
    isOnlyTimeoutVisible:
      totalElementInBottomImpactHeader === 1 && isTimeoutEnabled,
  };
}

/**
 * compute total input field shown in contact detail page
 * @returns {number}
 */
export function getContactScreenInputCount(): number {
  const countryCode = get(country);
  return (
    Number(!isContactHidden()) +
    Number(
      !isEmailHidden() || (countryCode && countryCode !== INDIA_COUNTRY_CODE)
    ) +
    Number(isPartialPayment()) * 2 +
    Number(isAddressEnabled() && !isPartialPayment()) * 4
  );
}

export const offerFade = writable(false);

export const showBackArrow = writable(false);
