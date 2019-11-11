const { visible } = require('../util');
const { readFileSync } = require('fs');

contents = String(
  readFileSync(__dirname + '/../fixtures/mockSuccessandFailPage.html')
);

async function assertHomePage(context, contactExists, emailExists) {
  expect(await context.page.$eval('[name=contact]', visible)).toEqual(
    contactExists
  );
  expect(await context.page.$eval('[name=email]', visible)).toEqual(
    emailExists
  );
}

async function fillUserDetails(context, isContactRequired) {
  if (isContactRequired)
    await context.page.type('[name=contact]', '9999988888');
  await context.page.type('[name=email]', 'pro@rzp.com');
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
