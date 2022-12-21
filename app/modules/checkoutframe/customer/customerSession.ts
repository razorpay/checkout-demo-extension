import { getSession } from 'sessionmanager';
import { Customer, getCustomer } from './base';
import { customer as customerStore } from 'checkoutstore/customer.js';
import { removeLitePreferencesFromStorage } from 'checkout-frame-lite/controller';
import { getOption } from 'razorpay';

/**
 * logout the customer instance on client by removing logged in status and clearing existing tokens
 * @param {Customer} customer The customer to be logged out
 */
export function logoutUserOnClient(customer: Customer) {
  const session = getSession();
  if (customer) {
    customer.markLoggedOut();
  }
  /**
   * can't use getView('topbar') because of circular dep
   */
  session.topBar?.setLogged(false);
  removeLitePreferencesFromStorage(getOption('key'));
}

/**
 * Logs the user out
 * Once the user state is changed to logged out, p13n will be triggered for logged out user.
 * we want p13n api to use the logged out cookie (and to prevent race condition), which is why we update the customer
 * instance as a callback to logout api sucess.
 * @param {number} phone number of logged in user
 * @param {boolean} outOfAllDevices Whether customer session should be logged out for all devices?
 * @param {function} callback Callback to invoke after logout is success.
 */
export function logUserOut(
  phone: string,
  outOfAllDevices: boolean,
  callback: (data: any) => void
) {
  const customer: Customer = getCustomer(phone);
  const session = getSession();

  function logoutSuccessCallback(data: any) {
    logoutUserOnClient(customer);

    callback && callback(data);

    customerStore.set(customer);

    // TODO remove
    if (session.svelteCardTab) {
      session.svelteCardTab.showLandingView();
    }
  }

  if (customer) {
    customer.logout(outOfAllDevices, logoutSuccessCallback);
  }
}
