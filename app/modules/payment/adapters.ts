import { checkMicroapp, googlePaySupportedMethods } from 'gpay';
import { NO_PAYMENT_ADAPTER_ERROR, CHECK_ERROR } from 'common/constants';
import {
  CRED_PACKAGE_NAME,
  GOOGLE_PAY_PACKAGE_NAME,
  PHONE_PE_PACKAGE_NAME,
} from 'upi/constants';
import { isBraveBrowser, samsungBrowser } from 'common/useragent';

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
export function checkPaymentAdapter(adapter: string) {
  const checker = ADAPTER_CHECKERS[adapter as keyof typeof ADAPTER_CHECKERS];

  if (checker) {
    return checker();
  }

  return Promise.reject({
    description: NO_PAYMENT_ADAPTER_ERROR,
  });
}

export function phonepePaymentRequestAdapter() {
  return new Promise<void>((resolve, reject) => {
    try {
      /**
       * PaymentRequest API is only available in the modern browsers which
       * have Promise API.
       */
      new (global as any).PaymentRequest(
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
        .then((isAvailable: boolean) => {
          if (isAvailable) {
            resolve();
          } else {
            reject(CHECK_ERROR);
          }
        })
        .catch(() => {
          reject(CHECK_ERROR);
        });
    } catch (e) {
      reject(CHECK_ERROR);
    }
  });
}

/**
 * Returns a Promise that resolves if it is Brave browser and rejects if Samsung browser is present.
 * @return {Promise}
 */
export const isBrowserAllowedByGpay = () => {
  return new Promise<void>((resolve, reject) => {
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

/**
 * Returns a Promise that resolves if Google Pay is present.
 * @return {Promise}
 */
export function gpayPaymentRequestAdapter() {
  return new Promise((resolve, reject) => {
    try {
      /**
       * PaymentRequest API is only available in the modern browsers which
       * have Promise API.
       */
      new (global as any).PaymentRequest(
        [{ supportedMethods: googlePaySupportedMethods }],
        {
          total: {
            label: '_',
            amount: { currency: 'INR', value: 0 },
          },
        }
      )
        .canMakePayment()
        .then((isAvailable: boolean) => {
          if (isAvailable) {
            isBrowserAllowedByGpay()
              .then(resolve)
              .catch(() => {
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
 * Returns a Promise that resolves if Cred is present.
 * @return {Promise}
 */
export function credPaymentRequestAdapter() {
  return new Promise<void>((resolve, reject) => {
    try {
      /**
       * PaymentRequest API is only available in the modern browsers which
       * have Promise API.
       */
      new (global as any).PaymentRequest(
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
        .then((isAvailable: boolean) => {
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
