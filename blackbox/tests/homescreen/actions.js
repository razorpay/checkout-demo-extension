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

/**
 *
 * @param {Context} context The test context
 * @param {String} selector selector to match the targeted element
 */
async function assertSelectorAbsence(context, selector) {
  const el = await context.page.$(selector);
  expect(el).toBe(null);
}

/**
 *
 * @param {Context} context The test context
 * @param {String} selector selector to match the targeted element
 * @param {String} attr Attribute that is to be asserted
 * @param {String} value Value that the attribute is supposed to have
 */
async function assertElementHasAttribute(
  context,
  selector,
  attr,
  value = true
) {
  const selectorElement = await context.page.waitForSelector(selector);
  const hasAttribute = await context.page.evaluate(
    (selectorElement, attr) => selectorElement.hasAttribute(attr),
    selectorElement,
    attr
  );
  expect(hasAttribute).toBe(value);
}

async function getTextContent(page, element) {
  try {
    return await page.evaluate(element => element.textContent, element);
  } catch (err) {
    return undefined;
  }
}

/**
 *
 * @param {Context} context The test context
 * @param {String} selector selector to match the targeted element
 * @param {String} value Value that is to be asserted
 */
async function assertTextContent(context, selector, value, contains = false) {
  const selectorInput = await context.page.waitForSelector(selector);
  const textContent = await getTextContent(context.page, selectorInput);
  if (!contains) {
    expect(textContent).toBe(value);
  } else {
    expect(textContent).toContain(value);
  }
}

module.exports = {
  proceed,
  handlePartialPayment,
  assertInputValue,
  getAttribute,
  getTextContent,
  assertTextContent,
  assertSelectorAbsence,
  assertElementHasAttribute,
  ...homeScreenActions,
  ...personalizationActions,
  ...downtimeTimeoutActions,
  ...emandateActions,
  ...paylaterActions,
  ...userDetailsActions,
  ...sharedActions,
};
