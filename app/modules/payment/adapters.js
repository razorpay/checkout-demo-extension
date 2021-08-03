import { checkMicroapp, googlePaySupportedMethods } from 'gpay';
import { NO_PAYMENT_ADAPTER_ERROR, CHECK_ERROR } from 'common/constants';
import {
  CRED_PACKAGE_NAME,
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
} from 'common/upi';
import { isBraveBrowser, samsungBrowser } from 'common/useragent';

const PaymentRequest = global.PaymentRequest;

export const supportedWebPaymentsMethodsForApp = {
  [PHONE_PE_PACKAGE_NAME]: 'https://mercury.phonepe.com/transact/pay',
  [CRED_PACKAGE_NAME]: ['https://cred.club/checkout/pay'],
};

export const ADAPTER_CHECKERS = {
  'microapps.gpay': checkMicroapp,
  [GOOGLE_PAY_PACKAGE_NAME]: gpayPaymentRequestAdapter,
  [PHONE_PE_PACKAGE_NAME]: phonepePaymentRequestAdapter,
  [CRED_PACKAGE_NAME]: credPaymentRequestAdapter,
};

/**
 * Checks if a payment adapter is present.
 * @param {String} adapter Payment Adapter
 * @param {Object} data Extra data to be passed.
 *
 * @return {Promise}
 */
export function checkPaymentAdapter(adapter, data = {}) {
  const checker = ADAPTER_CHECKERS[adapter];

  if (checker) {
    return checker(data);
  }

  return Promise.reject({
    description: NO_PAYMENT_ADAPTER_ERROR,
  });
}

function phonepePaymentRequestAdapter() {
  return new Promise((resolve, reject) => {
    try {
      /**
       * PaymentRequest API is only available in the modern browsers which
       * have Promise API.
       */
      new PaymentRequest(
        [
          {
            supportedMethods:
              supportedWebPaymentsMethodsForApp[PHONE_PE_PACKAGE_NAME],
            data: {
              url: '',
            },
          },
        ],
        {
          total: {
            label: '_',
            amount: { currency: 'INR', value: 10 },
          },
        }
      )
        .canMakePayment()
        .then((isAvailable) => {
          if (isAvailable) {
            resolve();
          } else {
            reject(CHECK_ERROR);
          }
        })
        .catch((e) => {
          reject(CHECK_ERROR);
        });
    } catch (e) {
      reject(CHECK_ERROR);
    }
  });
}

/**
 * Returns a Promise that resolves if Google Pay is present.
 * @return {Promise}
 */
export function gpayPaymentRequestAdapter() {
  const isBrowserAllowedByGpay = () => {
    return new Promise((resolve, reject) => {
      if (samsungBrowser) {
        // reject because Gpay does not work with samsung browser
        // The Gpay app opens and the payment fails at Gpay's end
        reject();
      }
      isBraveBrowser().then((result) => {
        if (!result) {
          resolve();
        } else {
          // Reject because of the same reason as Samsung
          // Gpay Mweb intent does not work with Brave Browser
          reject();
        }
      });
    });
  };

  return new Promise((resolve, reject) => {
    try {
      /**
       * PaymentRequest API is only available in the modern browsers which
       * have Promise API.
       */
      new PaymentRequest([{ supportedMethods: googlePaySupportedMethods }], {
        total: {
          label: '_',
          amount: { currency: 'INR', value: 0 },
        },
      })
        .canMakePayment()
        .then((isAvailable) => {
          if (isAvailable) {
            isBrowserAllowedByGpay()
              .then(resolve)
              .catch((e) => {
                reject(CHECK_ERROR);
              });
          } else {
            reject(CHECK_ERROR);
          }
        })
        /* jshint ignore:start */
        .catch(() => {
          reject(CHECK_ERROR);
        });
      /* jshint ignore:end */
    } catch (e) {
      reject(CHECK_ERROR);
    }
  });
}

/**
 * Returns a Promise that resolves if Google Pay is present.
 * @return {Promise}
 */
export function credPaymentRequestAdapter() {
  return new Promise((resolve, reject) => {
    try {
      /**
       * PaymentRequest API is only available in the modern browsers which
       * have Promise API.
       */
      new PaymentRequest(
        [
          {
            supportedMethods:
              supportedWebPaymentsMethodsForApp[CRED_PACKAGE_NAME],
          },
        ],
        {
          total: {
            label: '_',
            amount: { currency: 'INR', value: '10.00' },
          },
        }
      )
        .canMakePayment()
        .then((isAvailable) => {
          if (isAvailable) {
            resolve();
          } else {
            reject(CHECK_ERROR);
          }
        })
        /* jshint ignore:start */
        .catch(() => {
          reject(CHECK_ERROR);
        });
      /* jshint ignore:end */
    } catch (e) {
      reject(CHECK_ERROR);
    }
  });
}
