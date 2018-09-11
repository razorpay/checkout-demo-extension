var PaymentRequest = global.PaymentRequest;

const allowed_keys = [
  'rzp_test_1DP5mmOlF5G5ag',
  'rzp_live_izcpsDPjM13eLY', // razorpay
  'rzp_live_Vxe5F7uRkCXkXp', // rapido
  'rzp_live_uot7iROpZmbKeI', // freshtohome
  'rzp_live_N2JC92BOyrmMnC', // meesho
  'rzp_live_DpR4qRbfk9hGjd', // railyatri
  'rzp_live_CH3tA4XTOKFDVH', // testbook
  'rzp_live_Dptx8xPCtOoGSx', // shuttl
  'rzp_live_WbPAI53b1sGAN0', // playo
  'rzp_live_NjxztKBVEiesfV', // quickride
  'rzp_live_3dk2rs9s1b2p68', // urbanclap
  'rzp_live_bLR83mLuZGGPt5', // tinmen
  'rzp_live_ZHbHi1nZXd9N1o', // echallanapp
  'rzp_live_Y5HQwWkko9bkUf', // mytokri
  'rzp_live_XY9x0GfgAKrxfh', // pizzahut
  'rzp_live_w0ZAHP9naLomp1', // seniority
  'rzp_live_9dlWORqkx1U7KF', // perpule
];

export const checkKey = key => allowed_keys.indexOf(key) !== -1;

const googlePaySupportedMethods = ['https://tez.google.com/pay'];

export const check = (successCallback, errorCallback) => {
  errorCallback = errorCallback || (() => {});
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
          successCallback();
        } else {
          errorCallback();
        }
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

export const pay = (data, successCallback, errorCallback) => {
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
