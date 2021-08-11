import { CHECK_ERROR } from 'common/constants';

const PaymentRequest = global.PaymentRequest;

export const googlePaySupportedMethods = ['https://tez.google.com/pay'];

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
      .then((instrument) => {
        successCallback(instrument);

        return instrument.complete();
      })
      /* jshint ignore:start */
      .catch((e) => {
        errorCallback(e);
      });
    /* jshint ignore:end */
  } catch (e) {
    errorCallback(e);
  }
};

/**
 * Transforms the intent URL to a payload for microapps.
 * @param {string} intentUrl
 *
 * @returns {Object}
 */
function transformIntentForMicroappPayload(intentUrl) {
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
        },
        tokenizationSpecification: {
          type: 'DIRECT',
        },
      },
    ],
    transactionInfo: {
      countryCode: 'IN',
      totalPriceStatus: 'FINAL',
      totalPrice: Number(intentParams.am).toFixed(2),
      currencyCode: intentParams.cu,
      transactionNote: intentParams.tn,
    },
  };

  return payload;
}

/**
 * Creates a payment with the microapps API
 * @param {string} intentUrl
 *
 * @return {Promise}
 */
export function payWithMicroapp(intentUrl) {
  const payload = transformIntentForMicroappPayload(intentUrl);
  const { transactionReferenceId } =
    payload.allowedPaymentMethods[0].parameters;

  return global.microapps.requestPayment(payload).then((response) => {
    // Add Transaction reference ID in the response.
    if (response.paymentMethodData) {
      response.paymentMethodData.transactionReferenceId =
        transactionReferenceId;
    }

    return response;
  });
}

export const googlePayMergedCancelPayload = {
  '_[method]': 'app',
  '_[provider]': 'google_pay',
  '_[reason]': 'PAYMENT_CANCEL_ON_APP',
};
