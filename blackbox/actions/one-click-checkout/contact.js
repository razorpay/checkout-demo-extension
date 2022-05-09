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

module.exports = {
  editContactFromHome,
  resetContactDetails,
  editContactFromOTP,
};
