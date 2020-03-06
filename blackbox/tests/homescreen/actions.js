const {
  randomContact,
  randomEmail,
  delay,
  setState,
  find,
  getAttribute,
  innerText,
} = require('../../util');

const personalizationActions = require('./personalization-actions');
const downtimeTimeoutActions = require('./downtime-actions');
const emandateActions = require('./emandate-actions');
const paylaterActions = require('./paylater-actions');
const homeScreenActions = require('./homeActions');
const userDetailsActions = require('./userDetailsActions');
const sharedActions = require('./sharedActions');

const { proceed } = sharedActions;

/**
 * Selects the option to pay partially
 * and enters an amount
 */
async function handlePartialPayment(context, amount) {
  const payPartially = await context.page.waitForSelector(
    '.partial-payment-block button:nth-of-type(2)',
    {
      visible: true,
    }
  );

  await payPartially.click();

  setState(context, {
    partial: true,
  });

  const amountValue = await context.page.waitForSelector('#amount-value', {
    visible: true,
  });
  await amountValue.type(amount);

  await proceed(context);
}

/**
 *
 * @param {Context} context The test context
 * @param {String} selector selector to match the targeted element
 * @param {String} value Value that is to be asserted
 */
async function assertInputValue(context, selector, value) {
  const selectorInput = await context.page.waitForSelector(selector);
  const selectorInputValue = await context.page.evaluate(
    selectorInput => selectorInput.value,
    selectorInput
  );
  expect(selectorInputValue).toBe(value);
}

module.exports = {
  proceed,
  handlePartialPayment,
  assertInputValue,
  getAttribute,
  ...homeScreenActions,
  ...personalizationActions,
  ...downtimeTimeoutActions,
  ...emandateActions,
  ...paylaterActions,
  ...userDetailsActions,
  ...sharedActions,
};
