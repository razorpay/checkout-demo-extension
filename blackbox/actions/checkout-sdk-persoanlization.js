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
