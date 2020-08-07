import { gpayPaymentRequestAdapter, checkMicroapp } from 'gpay';
import { NO_PAYMENT_ADAPTER_ERROR } from 'common/constants';
import { GOOGLE_PAY_PACKAGE_NAME } from 'common/upi';

const ADAPTER_CHECKERS = {
  'microapps.gpay': checkMicroapp,
};

ADAPTER_CHECKERS[GOOGLE_PAY_PACKAGE_NAME] = gpayPaymentRequestAdapter;

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
