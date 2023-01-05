import { isMobileStore, screenStore } from 'checkoutstore';
import { getTPV } from 'checkoutstore/methods';
import { homeView } from 'checkoutstore/screens/home';
import { isMediumScreen, UCBrowser, isMIBrowser } from 'common/useragent';
import {
  isAddressEnabled,
  isContactHidden,
  isEmailHidden,
  isPartialPayment,
} from 'razorpay';
import { derived, writable } from 'svelte/store';
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
      ($anyFieldTouched && $isMobileStore) ||
      $bodyHeight > (isMediumScreen() ? 300 : 340) ||
      UCBrowser ||
      isMIBrowser
    ) {
      set(showFullScreen ? HEADER_SIZE.MEDIUM : HEADER_SIZE.MINIMAL);
    } else {
      set(showFullScreen ? HEADER_SIZE.FULL_SCREEN : HEADER_SIZE.MINIMAL);
    }
  }
);

export function getContactScreenInputCount(): number {
  const tpv = getTPV();
  return (
    Number(!isContactHidden()) +
    Number(!isEmailHidden()) +
    Number(isPartialPayment()) * 2 +
    Number(isAddressEnabled() && !isPartialPayment()) * 4 +
    Number(Boolean(tpv && !tpv.invalid))
  );
}

export const offerFade = writable(false);

export const showBackArrow = writable(false);
