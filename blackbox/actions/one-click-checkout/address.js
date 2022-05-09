const { setState, delay } = require('../../util');
const { getDataAttrSelector } = require('./common');

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

function getShippingInfoResponse({
  isCODEligible,
  serviceable = true,
  codFee = 0,
  shippingFee = 0,
  zipcode = '560001',
}) {
  const resp = {
    addresses: [
      {
        zipcode,
        country: 'in',
        city: 'Bengaluru',
        state: 'KARNATAKA',
        state_code: 'KA',
        cod: isCODEligible,
        cod_fee: codFee,
        shipping_fee: shippingFee,
        serviceable,
      },
    ],
  };

  return resp;
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

async function handleShippingInfo(context, options = {}) {
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('merchant/shipping_info');
  const resp = getShippingInfoResponse(options);
  const { shipping_fee, cod_fee } = resp.addresses[0];
  const state = {
    shippingFee: shipping_fee,
  };
  if (cod_fee) {
    state.codFee = cod_fee;
  }
  setState(context, state);
  await context.respondJSON(resp);
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

async function fillUserAddress(
  context,
  {
    isSaveAddress = true,
    isCODEligible = false,
    showSavedAddress = false,
    serviceable,
    codFee,
    zipcode = '560001',
    diffBillShipAddr,
    addLandmark = false,
  }
) {
  await context.page.waitForSelector('.address-new');
  if (!diffBillShipAddr) {
    await handleStateReq(context);
  }
  await context.page.type('#name', 'Test');
  await context.page.type('#zipcode', zipcode);
  if (!showSavedAddress && !diffBillShipAddr) {
    await handleShippingInfo(context, {
      isCODEligible,
      serviceable,
      codFee,
      zipcode,
    });
  }
  if (diffBillShipAddr) {
    await handlePincodes(context);
    await delay(400);
  }
  await context.page.type('#line1', 'SJR Cyber Laskar');
  await context.page.type('#line2', 'Hosur Road');
  if (addLandmark) {
    const landmarkCta = await getDataAttrSelector('toggle-landmark-cta');
    await landmarkCta.click();
    await delay(200);
    await context.page.type('#landmark', 'Adugodi');
  }
  if (!isSaveAddress) {
    await delay(200);
    await context.page.waitForSelector('#address-consent-checkbox');
    await context.page.click('#address-consent-checkbox');
  }
}

async function handleAddAddress(context) {
  await context.page.waitForSelector('#address-add');
  await context.page.click('#address-add');
}

async function handleCustomerAddressReq(context) {
  await context.getRequest(`/v1/customers/addresses`);
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('customers/addresses');
  await context.respondJSON(getCustomerAddressResponse());
  await delay(200);
}

async function handleCheckUnserviceable(context) {
  await context.page.waitForSelector('.failureText');
  expect(
    await context.page.$eval('.failureText', (el) => el.innerText)
  ).toEqual('Unserviceable');
}

async function unCheckBillAddress(context) {
  await context.page.waitForSelector('#same-address-checkbox');
  await context.page.click('#same-address-checkbox');
}

module.exports = {
  fillUserAddress,
  handleShippingInfo,
  handleAddAddress,
  handleCustomerAddressReq,
  handleCheckUnserviceable,
  unCheckBillAddress,
};
