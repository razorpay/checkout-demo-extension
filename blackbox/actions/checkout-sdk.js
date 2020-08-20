const { openCheckout } = require('./checkout');

async function openSdkCheckout({
  page,
  options,
  preferences,
  upiApps,
  apps,
  experiments,
  params,
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
          experiments,
          upiApps,
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

  await page.exposeFunction('__CheckoutBridge_processPayment', async data => {
    data = JSON.parse(data);
    if (data.type === 'application') {
      if (data.application_name === 'google_pay') {
        await page.evaluate(() => {
          window.externalSDKResponse({
            provider: 'GOOGLE_PAY',
            resultCode: -1,
            data: {
              apiResponse: {
                type: 'google_pay_cards',
              },
            },
          });
        });
        resolver(-1);
        return;
      }
    }
    console.error('malformed callback data', data);
  });

  if (params && params.platform === 'ios') {
    await page.evaluateOnNewDocument(options => {
      window.webkit = { messageHandlers: {} };
      window.webkit.messageHandlers.CheckoutBridge = {
        postMessage: function(data) {
          switch (data.action) {
            case 'callNativeIntent':
              setTimeout(function() {
                window.externalAppResponse({
                  provider: 'CRED',
                  data: 1,
                });
              });
              break;
            default:
              console.error(`iOSBridge: unhandled action ${data.action}`);
          }
        },
      };

      let interval = setInterval(function() {
        // Wait for Checkout to load...
        if (window.handleMessage) {
          clearInterval(interval);
          handleMessage({
            options: options,
            upi_intents_data: [],
            uri_data: [
              {
                shortcode: 'cred',
                uri: 'credpay',
              },
            ],
          });
        }
      }, 1500);
    }, options);
    // ^ Passing in options from closure to evaluate inside browser
  } else {
    await page.evaluateOnNewDocument(() => {
      window.CheckoutBridge = {
        oncomplete(data) {
          __CheckoutBridge_oncomplete(data);
        },
        isUserRegistered(data) {
          // Note:
          //   Don't put the following code within page.exposeFunction()
          //   We don't want this method to return a Promise!
          data = JSON.parse(data);
          if (data.method === 'card') {
            if (data.code === 'google_pay_cards') {
              return true;
            }
          }
          return false;
        },
        processPayment(data) {
          return __CheckoutBridge_processPayment(data);
        },
        callNativeIntent(data) {
          if (data.startsWith('credpay://')) {
            // setTimeout is necessary!
            setTimeout(function() {
              window.externalAppResponse({
                provider: 'CRED',
                data: 1,
              });
            });
          } else {
            throw `Could not handle callNativeIntent for ${data}`;
          }
        },
      };
    });
  }

  const context = await openCheckout({
    page,
    options,
    preferences,
    upiApps,
    apps,
    experiments,
    params,
  });

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
  openSdkCheckout,
};
