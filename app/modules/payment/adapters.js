import { check as checkGPay } from 'gpay';
import { NO_PAYMENT_ADAPTER_ERROR } from 'common/constants';

const ADAPTER_CHECKERS = {
  gpay: checkGPay,
};

/**
 * Checks if a payment adapter is present.
 * @param {String} adapter Payment Adapter
 * @param {Object} data Extra data to be passed.
 *
 * @return {Promise}
 */
export function checkPaymentAdapter(adapter, data) {
  const checker = ADAPTER_CHECKERS[adapter];

  if (checker) {
    return checker(data);
  }

  return Promise.reject({
    description: NO_PAYMENT_ADAPTER_ERROR,
  });
}
