import { getSession } from 'sessionmanager';
import { history, currentView } from 'one_click_checkout/routing/store';
import { screensHistory } from 'one_click_checkout/routing/History';
import { views } from 'one_click_checkout/routing/constants';
import { get } from 'svelte/store';
import { isOneClickCheckout } from 'checkoutstore';
import { isEditContactFlow, isLogoutFlow } from 'one_click_checkout/store';
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
import {
  savedAddresses,
  selectedAddress,
  selectedAddressId,
} from 'one_click_checkout/address/store';

import Analytics, { Events, MiscEvents } from 'analytics';
import MetaProperties from 'one_click_checkout/analytics/metaProperties';
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
  const address = get(selectedAddress);
  const addressType = get(selectedAddressId) ? 'saved' : 'new';

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
  session.oneClickCheckoutRedirection();
  if (!shouldNotPush) {
    screensHistory.push('methods');
  }
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
