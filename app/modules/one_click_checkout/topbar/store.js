import { derived, writable } from 'svelte/store';
import {
  SUMMARY_LABEL,
  ADDRESS_LABEL,
  PAYMENTS_LABEL,
} from 'one_click_checkout/topbar/i18n/label';
import { isLoggedIn } from 'checkoutstore/customer';
import { history } from 'one_click_checkout/routing/store';

export const breadcrumbItems = writable([
  SUMMARY_LABEL,
  ADDRESS_LABEL,
  PAYMENTS_LABEL,
]);

export const tabTitle = writable('');

export const shouldHideTab = derived(
  [isLoggedIn, history],
  ([$isLoggedIn, $history]) => {
    return {
      [SUMMARY_LABEL]: false,
      [PAYMENTS_LABEL]: false,
      [ADDRESS_LABEL]:
        $isLoggedIn &&
        $history.findIndex((route) =>
          route?.name?.toLowerCase()?.includes('address')
        ) === -1,
    };
  }
);
