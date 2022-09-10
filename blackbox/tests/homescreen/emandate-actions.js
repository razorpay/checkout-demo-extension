const accountNum = '1112220014911928';
const ifscCode = 'HDFC0000001';
const accountHolderName = 'Sakshi Jain';

/**
 * Get the textContent of an element
 */
async function innerText(page, element) {
  try {
    return await page.evaluate((element) => element.textContent, element);
  } catch (err) {
    return undefined;
  }
}

/**
 * Asserts that the user details in the strip for the Emandate
 * are the same as those entered.
 */
async function assertEmandateUserDetails(context) {
  if (!context.preferences.customer) {
    let { contact } = context.state;

    // Add the country code if missing
    if (contact && contact.indexOf('+91') !== 0) {
      contact = '+91' + contact;
    }

    const strip = await context.page.waitForSelector('#top-right', {
      visible: true,
    });
    const firstInPage = await innerText(context.page, await strip.$('#user'));
    expect(firstInPage).toEqual(contact);
  }
}

module.exports = {
  assertEmandateUserDetails,
};
