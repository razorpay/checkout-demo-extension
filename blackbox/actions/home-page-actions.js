const { visible, randomContact, randomEmail, delay } = require('../util');
const { readFileSync } = require('fs');

const contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

async function assertHomePage(context) {
  const $countryCode = await context.page.$('#country-code');
  expect(await $countryCode.isIntersectingViewport()).toEqual(
    !context.isContactEmailOptional
  );

  const $contact = await context.page.$('#contact');
  expect(await $contact.isIntersectingViewport()).toEqual(
    !context.isContactEmailOptional
  );

  const contact = await $contact.evaluate(el => el.value);
  const countryCode = await $countryCode.evaluate(el => el.value);

  expect(`${countryCode}${contact}`).toEqual(context.prefilledContact);

  const $email = await context.page.$('#email');
  expect(await $email.isIntersectingViewport()).toEqual(
    !context.isContactEmailOptional
  );
  expect(await $email.evaluate(el => el.value)).toEqual(context.prefilledEmail);
}

async function fillUserDetails(context, number = randomContact()) {
  // Remove the country code
  if (number.startsWith('+91')) {
    number = number.replace('+91', '');
  }

  if (!context.prefilledContact && !context.isContactOptional) {
    await context.page.type('#contact', number);
  }
  if (!context.prefilledEmail && !context.isEmailOptional) {
    await context.page.type('#email', randomEmail());
  }
}

async function assertPaymentMethods(context) {
  await context.page.waitForSelector('[tab=netbanking]');
  expect(await context.page.$eval('[tab=netbanking]', visible)).toEqual(true);
  expect(await context.page.$eval('[tab=wallet]', visible)).toEqual(true);
  expect(await context.page.$eval('[tab=card]', visible)).toEqual(true);
  if (
    context.preferences.methods.paylater !== undefined &&
    context.preferences.methods.paylater.epaylater === true
  ) {
    expect(await context.page.$eval('[tab=paylater]', visible)).toEqual(true);
  }
}

async function selectPaymentMethod(context, method) {
  await context.page.click('[tab=' + method + ']');
  // animation
  await delay(400);
}

module.exports = {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
};
