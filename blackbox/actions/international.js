const querystring = require('querystring');

const { visible } = require('../util');
const {
  getCardCurrencies,
  selectCurrency,
  verifyAmount,
} = require('./card-actions');
const { sendSiftJS } = require('./siftjs');

const NVS_DATA = {
  'nvs-first_name': 'test',
  'nvs-last_name': 'user',
  'nvs-line1': '21A Vincent Square',
  'nvs-line2': '',
  'nvs-postal_code': 'SW1P 2NA',
  'nvs-city': 'London',
  'nvs-state': 'Greater London',
  'nvs-country': 'GB',
};

const clickPaymentMethod = (context) => {
  return context.page.evaluate(() => {
    var instrumentList = document.querySelectorAll('.border-list > button');

    if (!instrumentList.length) {
      return false;
    }

    var instrument = Array.from(instrumentList).find((btn) => {
      var textContent = btn.textContent.trim();
      return textContent.includes('Instant Bank Transfer');
    });

    if (instrument) {
      instrument.click();
    }
  });
};

const clickProvider = async (context, provider) => {
  expect(
    await context.page.$eval(`#international-radio-${provider}`, visible)
  ).toBeTruthy();

  await context.page.click(`#international-radio-${provider}`);
};

const clickTrustly = (context) => {
  return context.page.evaluate(() => {
    var instrumentList = document.querySelectorAll(
      '#form-international .border-list > button'
    );

    if (!instrumentList.length) {
      return false;
    }

    const trustly = Array.from(instrumentList).find((btn) => {
      var textContent = btn.textContent.trim();
      return textContent.includes('Trustly');
    });

    if (trustly) {
      trustly.click();
    }
  });
};

const assertInternationalPage = async (
  context,
  el = 'div#international-radio-trustly'
) => {
  expect(await context.page.$eval(el, visible)).toBeTruthy();
};

const respondCurrencies = async (context, addressNameRequired = true) => {
  await context.getRequest(`/v1/payment/flows`);
  const req = await context.expectRequest();
  expect(req.url).toContain('/flows');
  expect(req.params).toHaveProperty('amount');
  expect(req.params).toHaveProperty('currency');
  const { amount } = req.params;
  const body = getCardCurrencies(amount, {
    address_name_required: addressNameRequired,
  });
  await context.respondJSONP(body);
};

const respondCountries = async (context) => {
  await context.getRequest('/v1/countries');
  const req = await context.expectRequest();
  expect(req.url).toContain('/countries');
  await context.respondJSON([
    {
      countryName: 'united kingdom',
      countryAlpha2Code: 'gb',
      countryAlpha3Code: 'GBR',
    },
  ]);
};

const respondStates = async (context) => {
  await context.getRequest('/v1/states');
  const req = await context.expectRequest();
  expect(req.url).toContain('/states');
  await context.respondJSON({
    countryName: 'united kingdom',
    countryAlpha2Code: 'gb',
    countryAlpha3Code: 'GBR',
    states: [
      { stateName: 'England', stateCode: 'GB-ENG' },
      { stateName: 'Northern Ireland', stateCode: 'GB-NIR' },
      { stateName: 'Scotland', stateCode: 'GB-SCT' },
      { stateName: 'Wales', stateCode: 'GB-WLS' },
    ],
  });
};

const assertMultiCurrenciesAndAmount = async ({
  context,
  currency = 'GBP',
  addressNameRequired,
  withSiftJS = false,
}) => {
  await respondCurrencies(context, addressNameRequired);
  await selectCurrency(context, currency);
  await verifyAmount(context, currency, addressNameRequired);
  if (withSiftJS) {
    // SiftJS integration will do a script fetch on DCC/Internal payment, hence it must be caught to avoid flow breaks
    await sendSiftJS(context);
  }
};

const isOnNVSScreen = (context) => {
  return context.page.evaluate(() => {
    return (
      document.getElementById('nvsContainer') !== null &&
      document.getElementById('billing-address-verification-first_name') !==
        null
    );
  });
};

const fillNVSForm = async (context) => {
  await context.page.evaluate((data) => {
    const keys = Object.keys(data);
    keys.forEach((id) => {
      document.getElementById(id).value = data[id];
    });
  }, NVS_DATA);

  await context.page.evaluate((data) => {
    const el = document.getElementById('nvs-country');
    if (el) {
      el.click();
      setTimeout(() => {
        const country = document.getElementById(
          `nvs_location_selector_${data['nvs-country']}_search_all`
        );
        country.click();
      }, 100);
    }
  }, NVS_DATA);
};

const assertNVSFormData = async (context) => {
  const InputData = await context.page.evaluate((data) => {
    const keys = Object.keys(data);
    let returnObj = {};
    keys.forEach((id) => {
      returnObj[id] = document.getElementById(id).value;
    });
    return returnObj;
  }, NVS_DATA);

  Object.keys(InputData).forEach((id) => {
    if (id === 'nvs-country') {
      expect(InputData[id]).toEqual('United Kingdom');
      return;
    }
    expect(InputData[id]).toEqual(NVS_DATA[id]);
  });
};

const assertNVSFormDataInRequest = async (
  context,
  currency = 'GBP',
  country = NVS_DATA['nvs-country']
) => {
  const request = await context.expectRequest();
  const body = querystring.parse(request.body);
  let check = {
    currency_request_id: 'EW1CiHoC8eARvW',
    dcc_currency: currency,
    'billing_address[first_name]': NVS_DATA['nvs-first_name'],
    'billing_address[last_name]': NVS_DATA['nvs-last_name'],
    'billing_address[line1]': NVS_DATA['nvs-line1'],
    'billing_address[country]': country,
    'billing_address[city]': NVS_DATA['nvs-city'],
    'billing_address[postal_code]': NVS_DATA['nvs-postal_code'],
  };
  expect(body).toMatchObject(check);
};

const assertVirtualAccountRequest = async ({
  context,
  currency,
  errorResponse,
}) => {
  const request = await context.expectRequest();
  expect(request.url).toContain(currency);
  expect(request.params).toMatchObject({
    currency,
    amount: '200',
  });
  const response = errorResponse
    ? { error: { description: 'Failed to fetch VA details' } }
    : {
        account: {
          routing_code: 'routing_code',
          routing_type: 'ACH',
          account_number: '1234567889',
          beneficiary_name: 'GemsGems',
          va_currency: currency,
        },
        amount: 1030,
        currency,
        symbol: '$',
      };
  await context.respondJSON(response);
  return response;
};

module.exports = {
  clickPaymentMethod,
  clickTrustly,
  assertInternationalPage,
  respondCurrencies,
  assertMultiCurrenciesAndAmount,
  isOnNVSScreen,
  fillNVSForm,
  assertNVSFormData,
  assertNVSFormDataInRequest,
  assertVirtualAccountRequest,
  respondCountries,
  respondStates,
  clickProvider,
};
