const { delay, assertVisible } = require('../../util');
const {
  getDataAttrSelector,
  handleShippingInfo,
  proceedOneCC,
} = require('./common');

async function handleStateReq(context, country = 'in') {
  const req = await context.expectRequest();
  expect(req.method).toBe('GET');
  expect(req.url).toContain(`countries/${country}/states`);
  await context.respondJSON([
    { name: 'Andaman and Nicobar Islands', state_code: 'AN' },
    { name: 'Andhra Pradesh', state_code: 'AP' },
    { name: 'Arunachal Pradesh', state_code: 'AR' },
    { name: 'Assam', state_code: 'AS' },
    { name: 'Bihar', state_code: 'BR' },
    { name: 'Chandigarh', state_code: 'CH' },
    { name: 'Chhattisgarh', state_code: 'CT' },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', state_code: 'DH' },
    { name: 'Delhi', state_code: 'DL' },
    { name: 'Goa', state_code: 'GA' },
    { name: 'Gujarat', state_code: 'GJ' },
    { name: 'Haryana', state_code: 'HR' },
    { name: 'Himachal Pradesh', state_code: 'HP' },
    { name: 'Jammu and Kashmir', state_code: 'JK' },
    { name: 'Jharkhand', state_code: 'JH' },
    { name: 'Karnataka', state_code: 'KA' },
    { name: 'Kerala', state_code: 'KL' },
    { name: 'Ladakh', state_code: 'LA' },
    { name: 'Lakshadweep', state_code: 'LD' },
    { name: 'Madhya Pradesh', state_code: 'MP' },
    { name: 'Maharashtra', state_code: 'MH' },
    { name: 'Manipur', state_code: 'MN' },
    { name: 'Meghalaya', state_code: 'ML' },
    { name: 'Mizoram', state_code: 'MZ' },
    { name: 'Nagaland', state_code: 'NL' },
    { name: 'Odisha', state_code: 'OR' },
    { name: 'Puducherry', state_code: 'PY' },
    { name: 'Punjab', state_code: 'PB' },
    { name: 'Rajasthan', state_code: 'RJ' },
    { name: 'Sikkim', state_code: 'SK' },
    { name: 'Tamil Nadu', state_code: 'TN' },
    { name: 'Telangana', state_code: 'TG' },
    { name: 'Tripura', state_code: 'TR' },
    { name: 'Uttar Pradesh', state_code: 'UP' },
    { name: 'Uttarakhand', state_code: 'UT' },
    { name: 'West Bengal', state_code: 'WB' },
  ]);
}

function getCustomerAddressResponse() {
  const resp = {
    shipping_address: {
      primary: true,
      name: 'Kumar',
      type: 'shipping_address',
      line1: 'SJR Cyber Laskar',
      line2: 'Hosur Road',
      zipcode: '560001',
      city: 'Bengaluru',
      state: 'KARNATAKA',
      tag: '',
      landmark: 'Adugodi',
      country: 'in',
      contact: '+919952398777',
      entity_type: 'customer',
      entity_id: 'Dmu5r158ITk2EB',
      id: 'IUBDoLcrmyJtpE',
      updated_at: 1638791683,
      created_at: 1638791683,
    },
  };

  return resp;
}

async function handlePincodes(context) {
  const req = await context.expectRequest();
  expect(req.method).toBe('GET');
  expect(req.url).toContain('locations/country');
  await context.respondJSON({
    city: 'Bengaluru',
    state: 'Karnataka',
    state_code: 'KA',
  });
}

async function switchCountry(context, country = 'US') {
  await delay(200);
  const el = await context.page.$('#country_name');
  await el.click();

  await context.page.$('.search-results');
  await context.page.click(`[id*=_${country}_]`);
}

async function fillUserAddress(
  context,
  {
    saveAddress = true,
    isCODEligible = false,
    serviceable,
    codFee,
    shippingFee,
    zipcode = '560001',
    isBillingAddress,
    addLandmark = false,
    internationalShippingEnabled = false,
    internationalPhoneNumber = false,
  }
) {
  await context.page.waitForSelector('.address-new');
  if (!isBillingAddress) {
    await handleStateReq(context);
  }

  await context.page.type('#name', 'Test');
  if (internationalShippingEnabled) {
    await switchCountry(context);
  }
  await context.page.type('#zipcode', zipcode);
  if (!isBillingAddress) {
    await handleShippingInfo(context, {
      isCODEligible,
      serviceable,
      codFee,
      shippingFee,
      zipcode,
    });
    if (shippingFee) {
      await delay(400);
      await checkShippingToastVisible(context);
    }
  } else {
    await handlePincodes(context);
    await delay(400);
  }
  await context.page.type('#line1', 'SJR Cyber Laskar');
  await context.page.type('#line2', 'Hosur Road');
  if (addLandmark) {
    await context.page.waitForSelector('[data-test-id=toggle-landmark-cta]');
    const landmarkCta = await getDataAttrSelector(
      context,
      'toggle-landmark-cta'
    );
    await delay(200);
    await landmarkCta.click();
    await delay(200);
    await context.page.type('#landmark', 'Adugodi');
  }
  if (!saveAddress && !internationalShippingEnabled) {
    await delay(200);
    const checkbox = await context.page.waitForSelector(
      '#address-consent-checkbox'
    );
    await checkbox.evaluate((cb) => cb.click());
  }
  if (internationalPhoneNumber) {
    await delay(200);
    expect(await context.page.$('#address-consent-checkbox')).toEqual(null);
  }
}

/**
 * takes user to add address form and fills the form
 */
async function handleAddAddress(context, options = {}, addresses = []) {
  const minAddresses = options.isBillingAddress ? 2 : 1;
  if (addresses.length >= minAddresses) {
    await context.page.waitForSelector('#address-add');
    await context.page.click('#address-add');
  }
  await fillUserAddress(context, options);
}

/**
 * clicks on add/change on Address widget in L0 screen
 */
async function handleManageAddress(context) {
  const manageAddrCTA = await getDataAttrSelector(
    context,
    'manage-address-cta'
  );
  await manageAddrCTA.click();
}

async function handleCustomerAddressReq(context) {
  await context.getRequest(`/v1/customers/addresses`);
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('customers/addresses');
  await context.respondJSON(getCustomerAddressResponse());
  await delay(200);
}

async function handleEditAddressReq(context) {
  await context.getRequest(`/v1/customers/addresses`);
  const req = await context.expectRequest();
  expect(req.method).toBe('PUT');
  expect(req.url).toContain('customers/addresses');
  await context.respondJSON(getCustomerAddressResponse());
  await delay(200);
}

async function assertUnserviceableAddress(context, addAddress) {
  if (addAddress) {
    await assertVisible('[data-test-id=toast-error]');
  } else {
    await assertVisible('[data-test-id=address-box-unserviceability]');
  }
  expect(
    await context.page.$eval('#redesign-v15-cta', (el) =>
      el.classList.contains('disabled')
    )
  ).toBe(true);
}

async function selectUnselectedAddress(context, addresses, index) {
  const inactiveAddrBox = await context.page.$(
    `#address-container-${addresses[index]?.id}`
  );
  await inactiveAddrBox.click();
}

/**
 * checks if address form has any invalid input
 * @param {object} context
 */
async function checkInvalidAddressForm(context) {
  await assertVisible('.error-field-one-click-checkout');
  expect(
    await context.page.$eval('#redesign-v15-cta', (el) =>
      el.classList.contains('disabled')
    )
  ).toBe(true);
}

async function unCheckBillAddress(context) {
  const el = await context.page.$('#same-address-checkbox');
  await el.click();
}

/**
 * @param {object} context
 * @param {boolean} isBillingAddress
 * clicks edit cta from address box and edits the title of address
 */
async function handleEditAddress(context, isBillingAddress) {
  const editCTA = await context.page.waitForSelector(
    '#address-container-selected [data-test-id="edit-cta"]'
  );
  await editCTA.click();
  await delay(200);
  const editMenuCTA = await context.page.waitForSelector(
    '#address-container-selected [data-test-id="edit-menu-cta"]'
  );
  await editMenuCTA.click();
  await context.page.waitForSelector('.address-new');
  if (isBillingAddress) {
    await handlePincodes(context);
  } else {
    await handleStateReq(context);
  }
  await delay(200);
  await context.page.type('#name', 'Testing Edit');
}

/**
 * @param {object} context
 * @param {boolean} isAdd if its for add address form
 * @param {array} addresses user saved addresses
 * to take user to add or edit billing address form
 */
async function handleBillingAddress(context, isAdd, addresses) {
  await unCheckBillAddress(context);
  await proceedOneCC(context);

  if (isAdd) {
    await handleAddAddress(
      context,
      {
        saveAddress: true,
        isBillingAddress: true,
      },
      addresses
    );
  } else {
    await handleEditAddress(context, true);
  }
}

async function checkStateFieldDisabled(context) {
  expect(
    await context.page.$eval('#state', (element) => element.disabled)
  ).toBeTruthy();
}

async function checkShippingToastVisible(context) {
  expect(
    await context.page.$eval('.toast-wrapper', (element) => !!element)
  ).toBeTruthy();
}

module.exports = {
  fillUserAddress,
  handleAddAddress,
  handleCustomerAddressReq,
  assertUnserviceableAddress,
  unCheckBillAddress,
  handleManageAddress,
  handleEditAddress,
  handleEditAddressReq,
  handleBillingAddress,
  checkStateFieldDisabled,
  checkInvalidAddressForm,
  selectUnselectedAddress,
};
