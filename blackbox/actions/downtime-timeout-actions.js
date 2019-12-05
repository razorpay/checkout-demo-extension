const { delay } = require('../util');

async function verifyHighDowntime(context, message) {
  const toolTip = await context.page.waitForSelector('.downtime .tooltip');
  const toolTipText = await context.page.evaluate(
    toolTip => toolTip.textContent,
    toolTip
  );
  expect(toolTipText).toContain(message);
}

async function verifyLowDowntime(context, message) {
  const warningDiv = await context.page.waitForSelector('.downtime-callout');
  // console.log(warningDiv);
  const warningText = await context.page.evaluate(
    warningDiv => warningDiv.textContent,
    warningDiv
  );
  expect(warningText).toContain(message);
}

async function verifyTimeout(context, paymentMode) {
  if (
    paymentMode == 'netbanking' ||
    paymentMode == 'card' ||
    paymentMode == 'upi' ||
    paymentMode == 'emi' ||
    paymentMode == 'tpv'
  ) {
    await delay(1000);
    expect(await context.page.$('#fd-hide')).not.toEqual(null);
    await delay(10000);
    expect(await context.page.$('#fd-hide')).toEqual(null);
  } else if (paymentMode == 'wallet') {
    await delay(5000);
    expect(await context.page.$('#footer')).not.toEqual(null);
    await delay(7000);
    expect(await context.page.$('#footer')).toEqual(null);
  }
}

module.exports = {
  verifyHighDowntime,
  verifyLowDowntime,
  verifyTimeout,
};
