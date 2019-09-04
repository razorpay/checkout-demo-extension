import { NO_PAYMENT_ADAPTER_ERROR } from 'common/constants';

const PaymentRequest = global.PaymentRequest;

const googlePaySupportedMethods = ['https://tez.google.com/pay'];

const CHECK_ERROR = {
  description: NO_PAYMENT_ADAPTER_ERROR,
};

/**
 * Returns a Promise that resolves if Google Pay is present.
 * @return {Promise}
 */
export function checkPaymentRequestApi() {
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

/**
 * Checks if Google Pay microapps API is available
 *
 * @returns {Promise}
 */
export function checkMicroapp() {
  return new Promise((resolve, reject) => {
    if (
      _Obj.hasProp(global, 'microapps') &&
      _Obj.hasProp(global.microapps, 'requestPayment')
    ) {
      return resolve();
    }

    return reject(CHECK_ERROR);
  });
}

export const payWithPaymentRequestApi = (
  data,
  successCallback,
  errorCallback
) => {
  var instrumentData = {};
  errorCallback = errorCallback || (() => {});

  data.intent_url
    .replace(/^.*\?/, '')
    .replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
      instrumentData[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  instrumentData.url = 'https://razorpay.com';
  const supportedInstruments = [
    {
      supportedMethods: googlePaySupportedMethods,
      data: instrumentData,
    },
  ];

  const details = {
    total: {
      label: 'Payment',
      amount: {
        currency: 'INR',
        value: parseFloat(instrumentData.am).toFixed(2),
      },
    },
  };

  try {
    const request = new PaymentRequest(supportedInstruments, details);
    request
      .show()
      .then(instrument => {
        successCallback(instrument);

        return instrument.complete();
      })
      /* jshint ignore:start */
      .catch(e => {
        errorCallback(e);
      });
    /* jshint ignore:end */
  } catch (e) {
    errorCallback(e);
  }
};

/**
 * Transforms the intent URL to a payload for microapps.
 * @param {string} paymentId
 * @param {string} intentUrl
 *
 * @returns {Object}
 */
function transformIntentForMicroappPayload(paymentId, intentUrl) {
  const intentParams = _.query2obj(intentUrl.split('?')[1]);

  const payload = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'UPI',
        parameters: {
          payeeVpa: intentParams.pa,
          payeeName: intentParams.pn,
          mcc: intentParams.mc,
          transactionReferenceId: intentParams.tr,
          transactionId: paymentId,
        },
        tokenizationSpecification: {
          type: 'DIRECT',
        },
      },
    ],
    transactionInfo: {
      countryCode: 'IN',
      totalPriceStatus: 'FINAL',
      totalPrice: intentParams.am,
      currencyCode: intentParams.cu,
      transactionNote: intentParams.tn,
    },
  };

  return payload;
}

/**
 * Creates a payment with the microapps API
 * @param {string} paymentId
 * @param {string} intentUrl
 *
 * @return {Promise}
 */
export function payWithMicroapp(paymentId, intentUrl) {
  const payload = transformIntentForMicroappPayload(paymentId, intentUrl);

  return global.microapps.requestPayment(payload);
}
