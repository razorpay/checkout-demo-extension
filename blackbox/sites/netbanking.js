const { delay, loadCheckoutFrame } = require('../util');

const goToNetbanking = async page => {
  await page.type('#contact', '9999999999');
  await page.type('#email', 'void@razorpay.com');
  await page.click('.payment-option[tab=netbanking] label');
};

const flowUsingButtons = async page => {
  await goToNetbanking(page);

  const netbankingOptions = await page.$$('#netb-banks .radio-label'),
    numNetbankingOptions = netbankingOptions.length;

  await netbankingOptions[
    Math.floor(Math.random(numNetbankingOptions) * 6)
  ].click();
};

const flowUsingDropdown = async page => {
  await goToNetbanking(page);

  const netbankingSelect = await page.$('#bank-select'),
    netbankingOptions = await netbankingSelect.$$eval('option', options => {
      return options.map(option => option.value).slice(1);
    }),
    numNetbankingOptions = netbankingOptions.length,
    randValue =
      netbankingOptions[Math.floor(Math.random() * numNetbankingOptions)];
  await page.evaluate(value => {
    document.querySelector('#bank-select').value = value;
    return Promise.resolve();
  }, randValue);
};

module.exports = async page =>
  new Promise(async (resolve, reject) => {
    let step = 1;

    await page.exposeFunction('renderHandler', async () => {
      await flowUsingButtons(page);

      await delay(100);

      await page.click('.pay-btn');
    });

    await page.exposeFunction('completeHandler', data => {
      if (JSON.parse(data).razorpay_payment_id) {
        console.log('netbanking payment through btn click passed');
        resolve();
      } else {
        console.log('netbanking payment through btn click failed');
        reject();
      }
    });

    await page.evaluate(`
      CheckoutBridge = {
        oncomplete: completeHandler,
        onrender: renderHandler
      }
    `);

    await loadCheckoutFrame(page);
    await page.evaluate(`handleMessage({
       options: {
          key: 'm1key',
          remember_customer: false
        }
     })`);
  });
