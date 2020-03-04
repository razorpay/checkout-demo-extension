const {
  randomContact,
  randomEmail,
  delay,
  setState,
  find,
  getAttribute,
  innerText,
} = require('../../util');

const { proceed } = require('./sharedActions');

/**
 * Asserts that the user details in the strip
 * are the same as those entered.
 */
async function assertUserDetails(context) {
  if (!context.preferences.customer) {
    let { contact, email } = context.state;

    // Add the country code if missing
    if (contact && contact.indexOf('+91') !== 0) {
      contact = '+91' + contact;
    }

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
    await proceed(context);
  } else {
    await delay(500);
    await proceed(context);
  }
  await assertUserDetails(context);
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
 * Makes sure that the details screen is visible
 * with contact and email fields
 */
async function assertBasicDetailsScreen(context) {
  const $form = await context.page.waitForSelector('#form-common', {
    visible: true,
  });
  if (!context.prefilledContact && !context.isContactOptional) {
    const $contact = await $form.$('#contact');

    let contact = context.prefilledContact;

    // Add the country code if missing
    if (contact && contact.indexOf('+91') !== 0) {
      contact = '+91' + contact;
    }

    if (!contact) {
      contact = '+91';
    }

    expect(await $contact.evaluate(el => el.value)).toEqual(contact);
  }
  if (!context.prefilledEmail && !context.isEmailOptional) {
    const $email = await $form.$('#email');

    expect(await $email.evaluate(el => el.value)).toEqual(
      context.prefilledEmail
    );
  }
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

module.exports = {
  assertUserDetails,
  assertEditUserDetailsAndBack,
  fillUserDetails,
  assertBasicDetailsScreen,
  assertMissingDetails,
};
