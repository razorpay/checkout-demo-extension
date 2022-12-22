import { screenStore } from 'checkoutstore';
import { getTPV } from 'checkoutstore/methods';
import { homeView, country } from 'checkoutstore/screens/home';
import { isMobile } from 'common/useragent';
import { INDIA_COUNTRY_CODE } from 'common/constants';
import {
  isAddressEnabled,
  isContactHidden,
  isEmailHidden,
  isPartialPayment,
} from 'razorpay';
import { derived, writable } from 'svelte/store';
import { HOME_VIEWS } from 'ui/tabs/home/constants';

export const fullScreenHeader = derived(
  [screenStore, homeView, country],
  ([$screenStore, $homeView, $country]) => {
    return (
      $country === INDIA_COUNTRY_CODE &&
      !isMobile() &&
      $screenStore === '' &&
      $homeView === HOME_VIEWS.DETAILS &&
      getContactScreenInputCount() === 1
    );
  }
);

function getContactScreenInputCount() {
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
