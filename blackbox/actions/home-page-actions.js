const { visible, randomContact, randomEmail } = require('../util');
const { readFileSync } = require('fs');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

async function assertHomePage(context) {
  const $contact = await context.page.$('#contact');
  expect(await $contact.isIntersectingViewport()).toEqual(
    !context.isContactEmailOptional
  );
  expect(await $contact.evaluate(el => el.value)).toEqual(
    context.prefilledContact
  );

  const $email = await context.page.$('#email');
  const value = await $email.getProperty('value');
  expect(await $email.isIntersectingViewport()).toEqual(
    !context.isContactEmailOptional
  );
  expect(await $email.evaluate(el => el.value)).toEqual(context.prefilledEmail);
}

async function fillUserDetails(context, placeHolder, number) {
  //placeHolder is used to handle true value

  if (!context.prefilledContact && !context.isContactOptional) {
    await context.page.type('#contact', number || randomContact());
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

async function assertPaymentMethodsPersonalization(context) {
  const text = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.option-title'),
      element => element.textContent
    )
  );
  await delay(2000);
  const apiOption = await context.page.$x(
    '//div[contains(@class, "option radio-option")]'
  );
  await apiOption[0].click();
}

async function selectPaymentMethod(context, method) {
  await context.page.click('[tab=' + method + ']');
}

module.exports = {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertPaymentMethodsPersonalization,
};
