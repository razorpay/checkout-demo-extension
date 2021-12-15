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

async function fillUserAddress(
  context,
  { isSaveAddress = true, isCODEligible = false, serviceable, codFee }
) {
  await context.page.waitForSelector('.address-new');
  await context.page.type('#name', 'Test');
  await context.page.type('#zipcode', '560001');
  await handleShippingInfo(context, { isCODEligible, serviceable, codFee });
  await context.page.type('#line1', 'SJR Cyber Laskar');
  await context.page.type('#line2', 'Hosur Road');
  await context.page.type('#landmark', 'Adugodi');
  if (!isSaveAddress) {
    await delay(200);
    await context.page.waitForSelector('#address-consent-checkbox');
    await context.page.click('#address-consent-checkbox');
  }
}

module.exports = {
  fillUserAddress,
  handleShippingInfo,
};
