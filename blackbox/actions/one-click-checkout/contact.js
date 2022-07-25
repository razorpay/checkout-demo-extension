const { getDataAttrSelector } = require('./common');

async function editContactFromHome(context) {
  const edtiCTA = await getDataAttrSelector(context, 'edit-contact');
  await edtiCTA.click();
}

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
  const editCTA = await getDataAttrSelector(context, 'edit-contact-otp');
  await editCTA.click();
}

async function checkPhoneValidation(context, phoneNumber, errMsg) {
  await context.page.type('#contact', phoneNumber);
  await context.page.$eval('#contact', element => element.blur());
  const validationErr = await context.page.$eval('.input-validation-error', element => element.textContent);
  expect(validationErr).toBe(errMsg)
}

module.exports = {
  editContactFromHome,
  resetContactDetails,
  editContactFromOTP,
  checkPhoneValidation,
};
