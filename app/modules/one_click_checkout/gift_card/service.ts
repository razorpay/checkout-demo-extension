// store imports
import { makeAuthUrl } from 'common/makeAuthUrl';

// util imports
import fetch from 'utils/fetch';
import { getOrderId } from 'razorpay';

// constant imports
import { GC_BASE_URL } from 'one_click_checkout/gift_card/constants';

// type imports
import type {
  applyGCParams,
  removeGCPayload,
  applyGCPayload,
} from 'one_click_checkout/gift_card/types/giftcard';

/**
 * Api call for applying Gift Card.
 * @return {Promise<Object>}
 */
export function handleGiftCardApply({
  giftCardValue = {},
  contact,
  email,
}: applyGCParams) {
  const { giftCardNumber: gift_card_number, giftCardPin: pin } =
    giftCardValue || {};
  const payload: applyGCPayload = {
    gift_card_number,
    contact,
  };

  if (email) {
    payload.email = email;
  }

  if (pin) {
    payload.pin = pin;
  }
  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl(`${GC_BASE_URL}/${getOrderId()}/giftcard/apply`),
      data: payload,
      callback: (response) => {
        if (response.status_code === 200) {
          resolve(response);
          return;
        }
        reject(response);
      },
    });
  });
}

/**
 * Api call for removing Gift Card.
 * @param {string} selectedGCNumber
 * @return {Promise<Object>}
 */
export function handleGiftCardRemove(selectedGCNumber: string[]) {
  const payload: removeGCPayload = {
    gift_card_numbers: selectedGCNumber,
  };

  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl(`${GC_BASE_URL}/${getOrderId()}/giftcard/remove`),
      data: payload,
      callback: (response) => {
        if (response.status_code === 200) {
          resolve(response);
          return;
        }
        reject(response);
      },
    });
  });
}
