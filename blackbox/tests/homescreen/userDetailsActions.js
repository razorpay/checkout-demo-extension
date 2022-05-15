const {
  randomContact,
  randomEmail,
  delay,
  setState,
  find,
  getAttribute,
  innerText,
  assertVisible,
} = require('../../util');

const { receiveApiInstruments } = require('./personalization-actions');

const {
  waitForSkeletonInstrumentsToResolve,
} = require('./checkout-config/config-utils');
const {
  handlePartialOrderUpdate,
} = require('../../actions/one-click-checkout/order');

/**
 * Asserts that the user details in the strip
 * are the same as those entered.
 */
async function assertUserDetails(context, apiInstrumentsReadFromCache = true) {
  if (
    !context.preferences.customer &&
    context.options.personalization !== false
  ) {
    if (!apiInstrumentsReadFromCache) {
      await receiveApiInstruments(context);
    }
  }
  if (!context.preferences.customer) {
    let { contact, email } = context.state;

    // Add the country code if missing
    if (contact && contact.indexOf('+91') !== 0) {
      contact = '+91' + contact;
    }

    const first = contact || email;
    const last = email;

    await assertVisible('#user-details [slot=title]');
    const firstInPage = await innerText(
      '#user-details [slot=title] span:first-child'
    );
    const lastInPage = await innerText(
      '#user-details [slot=title] span:last-child'
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

  await waitForSkeletonInstrumentsToResolve(context);
}

/**
 * Asserts that going back to edit
 * and returning keeps the behaviour intact
 */
async function assertEditUserDetailsAndBack(context) {
  await context.page.click('#user-details [slot=title]');
  await context.page.click('#footer');
  await assertUserDetails(context, true);
}

/**
 * Fill user contact and email
 */
async function fillUserDetails(context, number) {
  let contact = context.prefilledContact || number || randomContact();
  let email = context.prefilledEmail || randomEmail();

  // "+91" is already typed, remove the country code
  if (contact && contact.indexOf('+91') === 0) {
    contact = contact.replace('+91', '');
  }

  const readonlyContact =
    context.options.readonly && context.options.readonly.contact;
  const readonlyEmail =
    context.options.readonly && context.options.readonly.email;

  if (
    !context.prefilledContact &&
    !context.isContactOptional &&
    !readonlyContact
  ) {
    let contactToType = contact;

    // Remove the country code
    if (contactToType && contactToType.startsWith('+91')) {
      contactToType = contactToType.replace('+91', '');
    }

    await context.page.type('#contact', contactToType);

    if (context.options.one_click_checkout) {
      await context.page.focus('#email');
      await handlePartialOrderUpdate(context);
    }
  }

  if (!context.prefilledEmail && !context.isEmailOptional && !readonlyEmail) {
    await context.page.type('#email', email);

    if (context.options.one_click_checkout) {
      await context.page.focus('#contact');
      await handlePartialOrderUpdate(context);
    }
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
 * Makes sure that the details screen is visible
 * with contact and email fields
 */
async function assertBasicDetailsScreen(context) {
  if (!context.prefilledContact && !context.isContactOptional) {
    const $contact = await context.page.$('#contact');
    const $countryCode = await context.page.$('#country-code');

    let contact = context.prefilledContact;
    let countryCode = '+91';

    // Remove the country code from prefill
    if (contact && contact.startsWith('+91')) {
      contact = contact.replace('+91', '');
    }

    expect(await $countryCode.evaluate((el) => el.value)).toEqual(countryCode);
    expect(await $contact.evaluate((el) => el.value)).toEqual(contact);
  }
  if (!context.prefilledEmail && !context.isEmailOptional) {
    const $email = await context.page.$('#email');

    expect(await $email.evaluate((el) => el.value)).toEqual(
      context.prefilledEmail
    );
  }
}

async function assertMissingDetails(context) {
  const strip = await context.page.$('#user-details');
  if (!context.preferences.customer) {
    expect(strip).toEqual(null);
  } else {
    expect(strip).not.toEqual(null);
    await assertEditUserDetailsAndBack(context);
  }
}

module.exports = {
  assertUserDetails,
  assertEditUserDetailsAndBack,
  fillUserDetails,
  assertBasicDetailsScreen,
  assertMissingDetails,
};
