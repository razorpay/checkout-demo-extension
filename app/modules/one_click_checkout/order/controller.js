import { computeHash } from 'one_click_checkout/order/utils';
import { updateOrder } from 'one_click_checkout/order/service';
import { getDefaultCustomerDetails } from 'one_click_checkout/order/helpers';
import {
  isContactValid,
  isEmailValid,
} from 'one_click_checkout/order/validators';

let hash = null;

export function updateOrderWithCustomerDetails(
  payload = getDefaultCustomerDetails()
) {
  if (!Object.keys(payload).length) {
    return;
  }

  const { email = '', contact = '' } = payload;

  if (!isEmailValid(email)) {
    return;
  }

  if (!isContactValid(contact)) {
    return;
  }

  let newHash = computeHash(contact, email);

  if (newHash !== hash) {
    hash = newHash;

    updateOrder(payload);
  }
}
