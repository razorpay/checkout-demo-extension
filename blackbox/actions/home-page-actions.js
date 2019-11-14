const { visible, randomContact, randomEmail } = require('../util');
const { readFileSync } = require('fs');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

async function assertHomePage(context) {
  // await delay(10000);
  if (!context.prefilledContact && !context.isContactOptional) {
    const $contact = await context.page.$('#contact');
    expect(await $contact.isIntersectingViewport()).toEqual(
      !context.isContactEmailOptional
    );
    expect(await $contact.evaluate(el => el.value)).toEqual(
      context.prefilledContact
    );
  }
  if (!context.prefilledEmail && !context.isEmailOptional) {
    const $email = await context.page.$('#email');
    expect(await $email.isIntersectingViewport()).toEqual(
      !context.isContactEmailOptional
    );
    expect(await $email.evaluate(el => el.value)).toEqual(
      context.prefilledEmail
    );
  }
}

async function fillUserDetails(context) {
  if (!context.prefilledContact && !context.isContactOptional) {
    await context.page.type('#contact', randomContact());
  }

  if (!context.prefilledEmail && !context.isEmailOptional) {
    await context.page.type('#email', randomEmail());
  }
}

async function assertPaymentMethods(context) {
  expect(await context.page.$eval('[tab=netbanking]', visible)).toEqual(true);
  expect(await context.page.$eval('[tab=wallet]', visible)).toEqual(true);
  expect(await context.page.$eval('[tab=card]', visible)).toEqual(true);
}

async function selectPaymentMethod(context, method) {
  await context.page.click('[tab=' + method + ']');
}

module.exports = {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
};
