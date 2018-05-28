var PaymentRequest = window.PaymentRequest;

export const check = (successCallback, errorCallback) => {
  let error;
  try {
    /**
     * PaymentRequest API is only available in the modern browsers which
     * have Promise API.
     */
    new PaymentRequest([{ supportedMethods: 'https://tez.google.com/pay' }], {
      total: {
        label: '_',
        amount: { currency: 'INR', value: 0 }
      }
    })
      .canMakePayment()
      .then(isAvailable => {
        if (isAvailable) {
          successCallback();
        }
      })
      /* jshint ignore:start */
      .catch(e => {
        error = e;
      });
    /* jshint ignore:end */
  } catch (e) {
    error = e;
  }
  if (error && isFunction(errorCallback)) {
    errorCallback(error);
  }
};

export const pay = (data, successCallback, errorCallback) => {
  var instrumentData = {};
  data.intent_url
    .replace(/^.*\?/, '')
    .replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
      instrumentData[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  instrumentData.url = 'https://razorpay.com';
  const supportedInstruments = [
    {
      supportedMethods: ['https://tez.google.com/pay'],
      data: instrumentData
    }
  ];

  const details = {
    total: {
      label: 'Payment',
      amount: {
        currency: 'INR',
        value: parseFloat(instrumentData.am).toFixed(2)
      }
    }
  };

  let error;

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
        error = e;
      });
    /* jshint ignore:end */
  } catch (e) {
    error = e;
  }

  if (error && isFunction(errorCallback)) {
    errorCallback(error);
  }
};
