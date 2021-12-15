const { setState, delay } = require('../../util');

function getShippingInfoResponse({
  isCODEligible,
  serviceable = true,
  codFee = 0,
  shippingFee = 0,
}) {
  const resp = {
    addresses: [
      {
        zipcode: '560001',
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

async function handleShippingInfo(context, options) {
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
  expect(req.url).toContain('1cc/pincodes');
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
    diffBillShipAddr,
  }
) {
  await context.page.waitForSelector('.address-new');
  await context.page.type('#name', 'Test');
  await context.page.type('#zipcode', '560001');
  if (!showSavedAddress && !diffBillShipAddr) {
    await handleShippingInfo(context, { isCODEligible, serviceable, codFee });
  }
  if (diffBillShipAddr) {
    await handlePincodes(context);
    await delay(400);
  }
  await context.page.type('#line1', 'SJR Cyber Laskar');
  await context.page.type('#line2', 'Hosur Road');
  await context.page.type('#landmark', 'Adugodi');
  if (!isSaveAddress) {
    await delay(200);
    await context.page.waitForSelector('#address-consent-checkbox');
    await context.page.click('#address-consent-checkbox');
  }
}

async function handleAddAddress(context) {
  await context.page.waitForSelector('.address-add-icon');
  await context.page.click('.address-add-icon');
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
