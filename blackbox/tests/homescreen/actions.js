const { randomContact, randomEmail, delay } = require('../../util');
const personalizationActions = require('./personalization-actions');
const downtimeTimeoutActions = require('./downtime-actions');
const emandateActions = require('./emandate-actions.js');
const paylaterActions = require('./paylater-actions');

/**
 * Sets the state in context
 */
function setState(context, what = {}) {
  if (!context.state) {
    context.state = {};
  }

  let state = {
    ...context.state,
    ...what,
  };

  context.state = state;
}

/**
 * Get the textContent of an element
 */
async function innerText(page, element) {
  try {
    return await page.evaluate(element => element.textContent, element);
  } catch (err) {
    return undefined;
  }
}

/**
 * Get the value of an attribute on an element
 * @param {Page} page
 * @param {Element} element
 * @param {String} attribute
 */
async function getAttribute(page, element, attribute) {
  try {
    return await page.evaluate(
      (element, attribute) => element.getAttribute(attribute),
      element,
      attribute
    );
  } catch (err) {
    return undefined;
  }
}

/**
 * Array.find, but with async support
 * @param {Array} array
 * @param {Function} evaluator
 */
async function find(array, evaluator) {
  const promises = array.map(evaluator);

  const results = await Promise.all(promises);

  const index = results.findIndex(Boolean);

  return array[index];
}

/**
 * Makes sure that the details screen is visible
 * with contact and email fields
 */
async function assertBasicDetailsScreen(context) {
  const $form = await context.page.waitForSelector('#form-common', {
    visible: true,
  });
  if (!context.prefilledContact && !context.isContactOptional) {
    const $contact = await $form.$('#contact');

    expect(await $contact.evaluate(el => el.value)).toEqual(
      context.prefilledContact
    );
  }
  if (!context.prefilledEmail && !context.isEmailOptional) {
    const $email = await $form.$('#email');

    expect(await $email.evaluate(el => el.value)).toEqual(
      context.prefilledEmail
    );
  }
}

async function assertMethodsScreen(context) {
  const $form = await context.page.waitForSelector('#form-common', {
    visible: true,
  });
  const methods = await $form.$('.methods-container');

  expect(methods).not.toEqual(null);
}

async function assertMissingDetails(context) {
  const $form = await context.page.waitForSelector('#form-common', {
    visible: true,
  });
  const strip = await $form.$('#user-details');
  if (!context.preferences.customer) {
    expect(strip).toEqual(null);
  } else {
    expect(strip).not.toEqual(null);
    await assertEditUserDetailsAndBack(context);
  }
}

/**
 * Fill user contact and email
 */
async function fillUserDetails(context, number) {
  let contact = context.prefilledEmail || number || randomContact();
  let email = context.prefilledContact || randomEmail();

  if (!context.prefilledContact && !context.isContactOptional) {
    await context.page.type('#contact', contact);
  }

  if (!context.prefilledEmail && !context.isEmailOptional) {
    await context.page.type('#email', email);
  }

  const state = {
    contact,
    email,
  };

  if (context.isContactOptional) {
    delete state.contact;
  }

  if (context.isEmailOptional) {
    delete state.email;
  }

  setState(context, state);
}

/**
 * Click on the CTA
 */
async function proceed(context) {
  const proceed = await context.page.waitForSelector('#footer', {
    visible: true,
  });
  await proceed.click();
}

/**
 * Asserts that the user details in the strip
 * are the same as those entered.
 */
async function assertUserDetails(context) {
  if (!context.preferences.customer) {
    const { contact, email } = context.state;

    const first = contact || email;
    const last = email;

    const strip = await context.page.waitForSelector(
      '#user-details [slot=title]',
      {
        visible: true,
      }
    );
    const firstInPage = await innerText(
      context.page,
      await strip.$('span:first-child')
    );
    const lastInPage = await innerText(
      context.page,
      await strip.$('span:last-child')
    );

    if (!first && !last) {
      expect(firstInPage).toEqual(undefined);
      expect(lastInPage).toEqual(undefined);
    } else if (first) {
      expect(firstInPage).toEqual(first);
    } else if (last) {
      expect(lastInPage).toEqual(last);
    }
  }
}

/**
 * Asserts that going back to edit
 * and returning keeps the behaviour intact
 */
async function assertEditUserDetailsAndBack(context) {
  const strip = await context.page.waitForSelector(
    '#user-details [slot=title]',
    {
      visible: true,
    }
  );

  await strip.click();

  // TODO: Update details

  if (context.state && context.state.partial) {
    const nextButton = await context.page.waitForSelector('#footer', {
      visible: true,
    });
    await nextButton.click();
  } else {
    await delay(500);
    await proceed(context);
  }
  await assertUserDetails(context);
}

/**
 * Returns all available method buttons
 */
async function getMethodButtons(context) {
  const list = await context.page.waitForSelector('.methods-container', {
    visible: true,
  });
  return Array.from(await list.$$('button.new-method'));
}

/**
 * Returns all available method buttons
 */
async function getEmiButtons(context) {
  const list = await context.page.waitForSelector(
    '#form-cardless_emi .options',
    {
      visible: true,
    }
  );
  return Array.from(await list.$$('#form-cardless_emi .option-title'));
}

/**
 * Verify that methods are being shown
 */
async function assertPaymentMethods(context) {
  const buttons = await getMethodButtons(context);

  const methods = await Promise.all(
    buttons.map(button => getAttribute(context.page, button, 'method'))
  );
  expect([
    'card',
    'netbanking',
    'wallet',
    'upi',
    'emi',
    'bank_transfer',
    'paylater',
    'cardless_emi',
  ]).toEqual(expect.arrayContaining(methods));
}

/**
 * Select a payment method
 */
async function selectPaymentMethod(context, method) {
  const buttons = await getMethodButtons(context);

  const methodButton = await find(buttons, async button => {
    const buttonMethod = await getAttribute(context.page, button, 'method');

    return method === buttonMethod;
  });

  await methodButton.click();
}

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

  const nextButton = await context.page.waitForSelector('#footer', {
    visible: true,
  });
  await nextButton.click();
}

module.exports = {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePartialPayment,
  assertMethodsScreen,
  getMethodButtons,
  getEmiButtons,
  getAttribute,
  assertMissingDetails,
  ...personalizationActions,
  ...downtimeTimeoutActions,
  ...emandateActions,
  ...paylaterActions,
};
