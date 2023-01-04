import { get } from 'svelte/store';
import { contact, email, phone } from 'checkoutstore/screens/home';
import { moengageAnalytics } from 'one_click_checkout/merchant-analytics';
import { MOENGAGE_ACTIONS } from 'one_click_checkout/merchant-analytics/constant';

/**
 * Moengage requires user creation for new users
 * we will call the login function and Moengage will take care of
 * the user creation in case the phone number provided is a new one
 *
 * @param name name users enters in the address form
 */
export function addMoengageUser(name?: string) {
  if (get(phone)) {
    moengageAnalytics({
      actionType: MOENGAGE_ACTIONS.ADD_USER,
      value: get(phone),
    });
  }

  if (get(contact)) {
    moengageAnalytics({
      actionType: MOENGAGE_ACTIONS.ADD_MOBILE,
      value: get(contact), // has country code
    });
  }

  if (get(email)) {
    moengageAnalytics({
      actionType: MOENGAGE_ACTIONS.ADD_EMAIL,
      value: get(email),
    });
  }

  if (name) {
    moengageAnalytics({
      actionType: MOENGAGE_ACTIONS.ADD_USERNAME,
      value: name,
    });
  }
}
