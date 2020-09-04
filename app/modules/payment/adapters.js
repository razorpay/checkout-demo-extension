import { checkMicroapp, CHECK_ERROR, googlePaySupportedMethods } from 'gpay';
import { NO_PAYMENT_ADAPTER_ERROR } from 'common/constants';
import { GOOGLE_PAY_PACKAGE_NAME, PHONE_PE_PACKAGE_NAME } from 'common/upi';

const PaymentRequest = global.PaymentRequest;

const ADAPTER_CHECKERS = {
  'microapps.gpay': checkMicroapp,
};

const phonepeSupportedMethods = 'https://mercury.phonepe-stg.com/transact/pay';

ADAPTER_CHECKERS[GOOGLE_PAY_PACKAGE_NAME] = gpayPaymentRequestAdapter;
ADAPTER_CHECKERS[PHONE_PE_PACKAGE_NAME] = phonepePaymentRequestAdapter;

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
            supportedMethods: phonepeSupportedMethods,
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
        .then(isAvailable => {
          if (isAvailable) {
            resolve();
          } else {
            console.log('Payment Request not available!!');
            reject(CHECK_ERROR);
          }
        })
        /* jshint ignore:start */
        .catch(e => {
          console.log('CanmakePayment failed !!');
          reject(CHECK_ERROR);
        });
      /* jshint ignore:end */
    } catch (e) {
      console.log('Payment Request api undefined!!');
      reject(CHECK_ERROR);
    }
  });
}

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
      new PaymentRequest([{ supportedMethods: googlePaySupportedMethods }], {
        total: {
          label: '_',
          amount: { currency: 'INR', value: 0 },
        },
      })
        .canMakePayment()
        .then(isAvailable => {
          if (isAvailable) {
            resolve();
          } else {
            reject(CHECK_ERROR);
          }
        })
        /* jshint ignore:start */
        .catch(e => {
          reject(CHECK_ERROR);
        });
      /* jshint ignore:end */
    } catch (e) {
      reject(CHECK_ERROR);
    }
  });
}
