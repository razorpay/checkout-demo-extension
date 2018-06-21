const { delay, loadCheckoutFrame } = require('../util');

const fillCustomerDetails = async page => {
  await page.mainFrame().type('#contact', '9999999999');
  await page.mainFrame().type('#email', 'void@razorpay.com');
};

const goToNetbanking = async page => {
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
    let initalLoad = true;

    await page.exposeFunction('renderHandler', async () => {
      await fillCustomerDetails(page);

      if (initalLoad) {
        await flowUsingButtons(page);
      } else {
        await flowUsingDropdown(page);
      }

      await delay(100);

      await page.click('.pay-btn');
    });

    let firstStepResolve,
      firstStepPromise = new Promise(resolve => (firstStepResolve = resolve));

    await page.exposeFunction('completeHandler', data => {
      const title = initalLoad ? 'btn click' : 'dropdown';

      if (JSON.parse(data).razorpay_payment_id) {
        console.log('netbanking payment through ' + title + ' passed');

        if (!initalLoad) {
          return resolve();
        }
      } else {
        console.log('netbanking payment through ' + title + ' failed');
        reject();
      }

      firstStepResolve();
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

    await firstStepPromise;

    initalLoad = false;

    await page.reload();

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
