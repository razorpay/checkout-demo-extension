const { getDataAttrSelector } = require('./common');

async function resetContactDetails(context) {
  const detailsEle = await getDataAttrSelector(
    context,
    'payment-details-block'
  );
  await context.page.evaluate((ele) => {
    ele.querySelector('#contact').value = '';
    ele.querySelector('#email').value = '';
  }, detailsEle);
}

async function editContactFromOTP(context) {
  await context.page.$eval('.edit-contact-btn', (elem) => elem.click());
}

async function checkPhoneValidation(context, phoneNumber, errMsg) {
  await context.page.type('#contact', phoneNumber);
  await context.page.$eval('#contact', (element) => element.blur());
  const validationErr = await context.page.$eval(
    '.input-validation-error',
    (element) => element.textContent
  );
  expect(validationErr).toBe(errMsg);
}

module.exports = {
  resetContactDetails,
  editContactFromOTP,
  checkPhoneValidation,
};
