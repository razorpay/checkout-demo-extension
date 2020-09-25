const { openCheckout } = require('./checkout');

async function openSdkCheckoutPersonalization({
  page,
  options,
  preferences,
  apps,
}) {
  let paymentResult = null;
  let resolver = null;

  try {
    await page.exposeFunction('__CheckoutBridge_oncomplete', async data => {
      data = JSON.parse(data);
      if (data.error) {
        const newContext = await openCheckout({
          page,
          options,
          preferences,
          apps,
          params: {
            'error.description': data.error.description,
          },
        });
        Object.assign(returnObj, newContext);
      } else if (data.razorpay_payment_id) {
        paymentResult = data;
        resolver && resolver(data);
      } else {
        console.error('malformed callback data', data);
      }
    });
  } catch (err) {}

  await page.evaluateOnNewDocument(() => {
    window.CheckoutBridge = {
      oncomplete(data) {
        __CheckoutBridge_oncomplete(data);
      },
    };
    class PaymentRequest {
      canMakePayment = () => {
        const available = true;
        return Promise.resolve(available);
      };

      show = () => {
        const successPayload = {
          requestId: 'd16076cc-db82-4ced-8b88-a0608ea37f51',
          methodName: 'https://tez.google.com/pay',
          details: {
            tezResponse:
              '{"Status":"SUCCESS","amount":"1.00","txnRef":"FJQDoV8cnH20T3","toVpa":"razorpay.pg@hdfcbank","txnId":"ICI100037bf0ff743659c782aeacde83b86","responseCode":"0"}',
            txnId: 'ICI100037bf0ff743659c782aeacde83b86',
            responseCode: '0',
            ApprovalRefNo: '',
            Status: 'SUCCESS',
            txnRef: 'FJQDoV8cnH20T3',
            TrtxnRef: 'FJQDoV8cnH20T3',
            signature:
              '3045022060e893330caf8a0309b87e33dd98c920cd36e08ae9d9329b26175158ffefc06a02210089127a4e46515fde75619489f65f3372c8a2e2631eacf1736f781e3e71dbf81d',
            signatureKeyId: 'PAYMENT_RESPONSE_V1',
          },
          shippingAddress: null,
          shippingOption: null,
          payerName: null,
          payerEmail: null,
          payerPhone: null,
        };

        const failurePayload = {
          requestId: '3092df4c-9f3d-47ef-8e56-318c7513e398',
          methodName: 'https://tez.google.com/pay',
          details: {
            tezResponse:
              '{"txnId":"","responseCode":"ZD","Status":"FAILURE","txnRef":"FJQ1nu2B8JCh8L"}',
            txnId: '',
            responseCode: 'ZD',
            ApprovalRefNo: '',
            Status: 'FAILURE',
            txnRef: 'FJQ1nu2B8JCh8L',
            TrtxnRef: 'FJQ1nu2B8JCh8L',
            signature: '',
            signatureKeyId: '',
          },
          shippingAddress: null,
          shippingOption: null,
          payerName: null,
          payerEmail: null,
          payerPhone: null,
        };

        let payload = successPayload;

        return Promise.resolve({
          ...payload,
          complete: () => {},
        });
      };
    }

    window.PaymentRequest = PaymentRequest;
  });

  const context = await openCheckout({ page, options, preferences, apps });

  const returnObj = {
    ...context,
    getResult() {
      return new Promise((resolve, reject) => {
        if (paymentResult) {
          resolve(paymentResult);
        } else {
          resolver = resolve;
        }
      });
    },
  };

  return returnObj;
}

module.exports = {
  openSdkCheckoutPersonalization,
};
