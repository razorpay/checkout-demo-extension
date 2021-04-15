const { delay } = require('../util');

async function verifyMethodDisabled(context, message) {
  // const toolTip = await context.page.waitForSelector('.downtime .tooltip');
  // const toolTipText = await context.page.evaluate(
  //   toolTip => toolTip.textContent,
  //   toolTip
  // );
  // expect(toolTipText).toContain(message);
}

async function verifyMethodWarned(context, message, method) {
  let selector = '.downtime-callout';

  // if (method) {
  //   selector = ['netbanking', 'upi', 'upi_otm'].includes(method)
  //     ? `.bottom:not([tab]) ${selector}`
  //     : `#form-${method}.drishy ~ #bottom .bottom[tab="${method}"] ${selector}`;
  // }

  const warningDiv = await context.page.waitForSelector(selector);
  const warningText = await context.page.evaluate(
    warningDiv => warningDiv.textContent,
    warningDiv
  );
  expect(warningText).toContain(message);
}

/**
 * Waits for a given selector to be null
 * @param {Page} page
 * @param {string} selector
 * @param {number} timeout
 */
function waitForRemoval(page, selector, timeout = 8000) {
  return new Promise(async (resolve, reject) => {
    let time = 0;

    const interval = setInterval(async () => {
      time += 300;

      if (time >= timeout) {
        clearInterval(interval);
        return reject();
      }

      const el = await page.$(selector);

      if (!el) {
        clearInterval(interval);
        return resolve();
      }
    }, 300);
    await page.waitForSelector(selector);
  });
}

async function verifyTimeout(context, paymentMode) {
  let selector;

  if (
    paymentMode == 'netbanking' ||
    paymentMode == 'card' ||
    paymentMode == 'upi' ||
    paymentMode == 'emi' ||
    paymentMode == 'tpv' ||
    paymentMode == 'paylater'
  ) {
    selector = '#fd-hide';
  } else if (paymentMode == 'wallet') {
    selector = '#footer;';
  }

  if (selector) {
    await waitForRemoval(context.page, selector, 10000);
    expect(await context.page.$(selector)).toEqual(null);
  }
}

module.exports = {
  verifyMethodDisabled,
  verifyMethodWarned,
  verifyTimeout,
};
