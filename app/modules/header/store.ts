import { isMobileStore, screenStore } from 'checkoutstore';
import { getTPV } from 'checkoutstore/methods';
import { country, homeView } from 'checkoutstore/screens/home';
import { INDIA_COUNTRY_CODE } from 'common/constants';
import { isMediumScreen, UCBrowser, isMIBrowser } from 'common/useragent';
import {
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
      getContactScreenInputCount() <= 2 &&
      !isOfferForced();
    if (
      ($anyFieldTouched && $isMobileStore) ||
      $bodyHeight > (isMediumScreen() ? 300 : 340) ||
      UCBrowser ||
      isMIBrowser
    ) {
      set(
        showFullScreen && $bodyHeight < 475
          ? HEADER_SIZE.MEDIUM
          : HEADER_SIZE.MINIMAL
      );
    } else {
      set(showFullScreen ? HEADER_SIZE.FULL_SCREEN : HEADER_SIZE.MINIMAL);
    }
  }
);

export function getContactScreenInputCount(): number {
  const tpv = getTPV();
  const countryCode = get(country);
  return (
    Number(!isContactHidden()) +
    Number(
      !isEmailHidden() || (countryCode && countryCode !== INDIA_COUNTRY_CODE)
    ) +
    Number(isPartialPayment()) * 2 +
    Number(isAddressEnabled() && !isPartialPayment()) * 4 +
    Number(Boolean(tpv && !tpv.invalid))
  );
}

export const offerFade = writable(false);

export const showBackArrow = writable(false);
