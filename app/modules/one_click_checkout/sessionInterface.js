// session imports
import { getSession } from 'sessionmanager';
// helpers imports
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { getCustomerDetails } from 'common/helpers/customer';
import { navigator } from 'one_click_checkout/routing/helpers/routing';
// store imports
import { get } from 'svelte/store';
import { isOneClickCheckout } from 'razorpay';
import { history, activeRoute } from 'one_click_checkout/routing/store';
import {
  savedAddresses,
  isBillingSameAsShipping,
} from 'one_click_checkout/address/store';
import {
  selectedAddress as selectedShippingAddress,
  selectedAddressId as selectedShippingAddressId,
  selectedCountryISO as selectedShippingCountryISO,
  newUserAddress,
  showCodLoader,
} from 'one_click_checkout/address/shipping_address/store';
import {
  isEditContactFlow,
  isLogoutFlow,
  isCodForced,
} from 'one_click_checkout/store';
import {
  selectedAddress as selectedBillingAddress,
  selectedCountryISO as selectedBillingCountryISO,
} from 'one_click_checkout/address/billing_address/store';
import { tabTitle, tabTitleLogo } from 'one_click_checkout/topbar/store';
// analytics imports
import Analytics, { Events, MiscEvents } from 'analytics';
import MetaProperties from 'one_click_checkout/analytics/metaProperties';
// service imports
import {
  updateOrder,
  thirdWatchCodServiceability,
} from 'one_click_checkout/address/service';
// constants imports
import { views } from 'one_click_checkout/routing/constants';

import { showSummaryModal } from 'one_click_checkout/summary_modal/index';
import { INDIA_COUNTRY_CODE } from 'common/constants';

export const historyExists = () => get(history).length;

/**
 * Method called, when back action is triggered.
 */
export const handleBack = () => {
  const session = getSession();
  let handleBack = get(activeRoute)?.props?.handleBack;

  if (handleBack) {
    handleBack();
  }
  tabTitle.set('');
  tabTitleLogo.set('');
  const currHistory = get(history);
  if (!get(activeRoute)?.isBackEnabled && currHistory.length === 1) {
    session.closeModal();
    return;
  }
  navigator.navigateBack();
};

export function getLandingView() {
  return get(history)[0];
}

/**
 * Handle all the edit contact functionality for 1CC flows
 */
export function handleEditContact(logoutFlow = false) {
  if (!isOneClickCheckout()) return;
  Events.TrackBehav(MiscEvents.EDIT_CONTACT_CLICK, {
    screen_name: navigator.currentActiveRoute?.name,
  });
  const session = getSession();
  if (session.tab !== 'home-1cc') {
    session.switchTab('home-1cc');
  }
  const params = { path: views.DETAILS };
  if (logoutFlow) {
    resetOrder(true);
    isLogoutFlow.set(true);
    params.initialize = true;
  } else {
    isEditContactFlow.set(true);
  }
  navigator.navigateTo(params);
}

export function getIcons() {
  const session = getSession();
  return session.themeMeta.icons;
}

export function getTheme() {
  const session = getSession();

  return session.themeMeta;
}

/**
 * Redirecting the flow from 1cc to payment screens
 */
export function redirectToPaymentMethods(
  { shouldUpdateOrder, showSnackbar } = {
    shouldUpdateOrder: true,
    showSnackbar: true,
  }
) {
  const customer = getCustomerDetails();
  const session = getSession();
  const address = get(selectedShippingAddress);
  const addressType = get(selectedShippingAddressId) ? 'saved' : 'new';
  let billing_address = get(selectedBillingAddress);
  if (get(isBillingSameAsShipping)) {
    billing_address = address;
    selectedBillingCountryISO.set(get(selectedShippingCountryISO));
  }

  Analytics.setMeta(MetaProperties.IS_USER_LOGGED_IN, customer.logged);
  Analytics.setMeta(
    MetaProperties.SAVED_ADDRESS_COUNT,
    get(savedAddresses).length
  );
  const { country, state, city, zipcode, contact, id } = address;
  if (id) {
    Analytics.setMeta(MetaProperties.ADDRESS_ID, id);
  }
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_TYPE, addressType);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_COUNTRY, country);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_STATE, state);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_CITY, city);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_PINCODE, zipcode);
  Analytics.setMeta(MetaProperties.SHIPPING_ADDRESS_CONTACT, contact);
  Analytics.setMeta(
    MetaProperties.COUNTRY_CODE,
    contact?.countryCode || INDIA_COUNTRY_CODE
  );
  Analytics.setMeta(
    MetaProperties.COUNTRY,
    country || get(selectedShippingCountryISO)
  );

  // If navigating from methods->details->methods we need not to update the order
  if (shouldUpdateOrder) {
    updateOrder(address, billing_address)
      .then(() => {
        if (address.cod) showCodLoader.set(true);
        session.oneClickCheckoutRedirection(showSnackbar);
        navigator.navigateTo({ path: views.METHODS });

        if (isCodForced()) {
          showCodLoader.set(false);
        }

        thirdWatchCodServiceability(address)
          .then((res) => {
            session.homeTab.codActions();
            if (isCodForced()) return;

            if (addressType === 'saved') {
              const newAddresses = get(savedAddresses).map((item) => {
                if (item.id === address.id && item.cod) {
                  item.cod = res?.cod;
                }
                return item;
              });
              savedAddresses.set(newAddresses);
            } else {
              const newAddressServiceability =
                get(newUserAddress).cod && res?.cod;
              newUserAddress.set({
                ...get(newUserAddress),
                cod: newAddressServiceability,
              });
            }
            showCodLoader.set(false);
          })
          .catch(() => {
            showCodLoader.set(false);
          });
      })
      .catch((e) => {
        session.updateOrderFailure();
        const currhis = get(history);
        const savedAddArr = currhis.find(
          (item) => item.name === views.SAVED_ADDRESSES
        );
        if (savedAddArr && Object.keys(savedAddArr).length > 0) {
          navigator.navigateBack(views.SAVED_ADDRESSES);
        } else if (get(savedAddresses)?.length) {
          navigator.navigateBack(views.ADD_ADDRESS);
          navigator.replace(views.SAVED_ADDRESSES);
        } else {
          navigator.navigateBack(views.ADD_ADDRESS);
        }
      });
  } else {
    session.oneClickCheckoutRedirection(showSnackbar);
  }
}

/**
 * Handles the events binding needed
 * @param {string} selector
 */
export function bindEvents(selector) {
  const session = getSession();

  session.bindEvents(selector);
}

export function redirectToMethods() {
  const session = getSession();
  session.oneClickCheckoutRedirection();
}

export function showOrderSummary() {
  showSummaryModal(true);
}
