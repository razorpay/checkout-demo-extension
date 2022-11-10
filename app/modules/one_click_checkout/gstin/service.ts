// store imports
import { makeAuthUrl } from 'common/makeAuthUrl';

// util imports
import fetch from 'utils/fetch';
import { getOrderId } from 'razorpay';

// constant imports
import { ORDER_NOTES_URI } from 'one_click_checkout/gstin/constants';

// type imports
import type {
  UpdateOrderNotes,
  UpdateOrderApiPayload,
} from 'one_click_checkout/gstin/types';

/**
 * Api call for adding GSTIN Information.
 * @return {Promise<Object>}
 */
export function updateOrderNotes({
  gstIn = '',
  orderInstruction = '',
}: UpdateOrderNotes) {
  const payload: UpdateOrderApiPayload = {};
  if (gstIn) {
    payload.gstin = gstIn;
  }
  if (orderInstruction) {
    payload.order_instructions = orderInstruction;
  }
  return new Promise((resolve, reject) => {
    fetch.patch({
      url: makeAuthUrl(ORDER_NOTES_URI.replace('{id}', getOrderId())),
      data: payload,
      callback: (response) => {
        if (response?.error) {
          return reject(response);
        }
        resolve(response);
      },
    });
  });
}
