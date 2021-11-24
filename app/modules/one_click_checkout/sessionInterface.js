// session imports
import { getSession } from 'sessionmanager';
// helpers imports
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';

// store imports
import { get } from 'svelte/store';
import { isOneClickCheckout } from 'checkoutstore';
import { history, currentView } from 'one_click_checkout/routing/store';
import {
  savedAddresses,
  isBillingSameAsShipping,
} from 'one_click_checkout/address/store';
import {
  selectedAddress as selectedShippingAddress,
  selectedAddressId as selectedShippingAddressId,
} from 'one_click_checkout/address/shipping_address/store';
import { isEditContactFlow, isLogoutFlow } from 'one_click_checkout/store';
import { selectedAddress as selectedBillingAddress } from 'one_click_checkout/address/billing_address/store';
// analytics imports
import Analytics, { Events, MiscEvents } from 'analytics';
import MetaProperties from 'one_click_checkout/analytics/metaProperties';
// service imports
import { updateOrder } from 'one_click_checkout/address/service';
// constants imports
import { views } from 'one_click_checkout/routing/constants';

import { screensHistory } from 'one_click_checkout/routing/History';
import { showSummaryModal } from 'one_click_checkout/summary_modal/index';

export const historyExists = () => get(history).length;

export const handleBack = () => {
  screensHistory.pop();
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
    screen_name: get(currentView),
  });
  const session = getSession();
  if (session.tab !== 'home-1cc') {
    session.switchTab('home-1cc');
  }
  if (logoutFlow) {
    resetOrder(true);
    isLogoutFlow.set(true);
    screensHistory.initialize(views.DETAILS);
  } else {
    isEditContactFlow.set(true);
    screensHistory.push(views.DETAILS);
  }
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
export function redirectToPaymentMethods(shouldNotPush = false) {
  const customer = getCustomerDetails();
  const address = get(selectedShippingAddress);
  const addressType = get(selectedShippingAddressId) ? 'saved' : 'new';
  let billing_address = get(selectedBillingAddress);
  if (get(isBillingSameAsShipping)) {
    billing_address = address;
  }

  Analytics.setMeta(MetaProperties.IS_USER_LOGGED_IN, customer.logged);
  Analytics.setMeta(
    MetaProperties.SAVED_ADDRESS_COUNT,
    get(savedAddresses).length
  );
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_TYPE, addressType);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_COUNTRY, address.country);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_STATE, address.state);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_CITY, address.city);
  Analytics.setMeta(MetaProperties.SELECTED_ADDRESS_PINCODE, address.zipcode);
  Analytics.setMeta(MetaProperties.SHIPPING_ADDRESS_CONTACT, address.contact);
  const session = getSession();
  updateOrder(address, billing_address)
    .then((response) => {
      session.oneClickCheckoutRedirection();
      if (!shouldNotPush) {
        screensHistory.push('methods');
      }
    })
    .catch((error) => {
      session.updateOrderFailure();
      if (get(savedAddresses)?.length) {
        screensHistory.popUntil(views.SAVED_ADDRESSES);
      } else {
        screensHistory.popUntil(views.ADD_ADDRESS);
      }
    });
}

/**
 * Pops in the screen history array
 */
export function historyPop() {
  screensHistory.pop();
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
  session.oneClickCheckoutRedirection(true);
}

export function showOrderSummary() {
  showSummaryModal(true);
}
