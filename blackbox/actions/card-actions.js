const { delay, innerText, visible, makeJSONResponse } = require('../util');
const { assertTrimmedInnerText } = require('../tests/homescreen/actions');
const querystring = require('querystring');
const { sendSiftJS } = require('./siftjs');
const {
  expectCountriesAPI,
  expectStatesAPI,
} = require('./avs-countries-states');

const AVS_DATA = {
  line1: '21A Vincent Square',
  line2: '',
  postal_code: 'SW1P 2NA',
  city: 'London',
  state: 'England',
  country: 'GB',
};

async function handleCardValidation(context, { urlShouldContain } = {}) {
  const response = {
    type: 'first',
    request: {
      url: 'http://localhost:9008',
      method: 'get',
      content: [],
    },
    payment_id: 'pay_DLXKaJEF1T1KxC',
    amount: '\u20b9 51',
    image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
  };

  let req = await context.getRequest('/v1/payments/create/ajax');
  if (!req) {
    const req = await context.expectRequest();
    expect(req.url).toContain(urlShouldContain || 'create/ajax');
    await context.respondJSON(response);
    return;
  }
  req.respond(makeJSONResponse(response));
  context.resetRequest(req);
}

async function fillAVSForm({
  context,
  isNameRequired,
  countryCode = AVS_DATA.country,
}) {
  // fill avs data
  await expectCountriesAPI(context);
  if (isNameRequired) {
    await context.page.type('#billing-address-verification-first_name', 'test');
    await context.page.type('#billing-address-verification-last_name', 'user');
  }

  await context.page.type(
    '#billing-address-verification-line1',
    AVS_DATA.line1
  );
  await context.page.type('#billing-address-verification-city', AVS_DATA.city);
  await context.page.type(
    '#billing-address-verification-postal_code',
    AVS_DATA.postal_code
  );
  await context.page.click('#billing-address-verification-country');
  await delay(200);
  await context.page.click(
    `#billing-address-verification-location-country_${countryCode}_0_search_all`
  ); // Select United Kingdom(GB) or countryCode
  await expectStatesAPI(context);
  await delay(200);
  await context.page.click('#billing-address-verification-state');
  await delay(200);
  await context.page.click(
    '#billing-address-verification-location-state_search_results .list-data'
  ); // Select England
}

async function assertAVSFormData(context) {
  // assert AVS data
  const InputData = await context.page.evaluate((data) => {
    const keys = Object.keys(data);
    let returnObj = {};
    keys.forEach((id) => {
      returnObj[id] = document.getElementById(
        `billing-address-verification-${id}`
      ).value;
    });
    return returnObj;
  }, AVS_DATA);

  Object.keys(InputData).forEach((id) => {
    if (id.includes('country')) {
      expect(InputData[id]).toEqual('United Kingdom');
    } else {
      expect(InputData[id]).toEqual(AVS_DATA[id]);
    }
  });
}

async function handleCardValidationForNativeOTP(
  context,
  { coproto, cardType, urlShouldContain, expectCallbackUrl } = {}
) {
  const req = await context.expectRequest();
  const body = querystring.parse(req.body);
  if (expectCallbackUrl) {
    expect(body.callback_url).toEqual(
      'http://www.merchanturl.com/callback?test1=abc&test2=xyz'
    );
  }
  expect(req.url).toContain(urlShouldContain || 'create/ajax');
  if (cardType === 'RUPAY' && coproto === 'otp') {
    await context.respondJSON({
      type: 'otp',
      request: {
        method: 'direct',
        content: '',
      },
      version: 1,
      payment_id: 'pay_Ep1kkNJDzAdvIZ',
      next: ['otp_submit', 'otp_resend'],
      gateway:
        'eyJpdiI6IjVmNmxSN2FrTlE0R2I3QThtSnFLR3c9PSIsInZhbHVlIjoib29IRmFBTWxEaG0xQVp3Tm95U0pNZExGN2lsQnBJWkJlcDJaQ0xmQ1p1UT0iLCJtYWMiOiIzYTZhYTczNWJhN2M4YzBlMDlmODYxMjIxN2Y3Y2FiNjdkNzgyYmZhZTRkMDY3MTNiZjI2YTEzZWMwYjJlOGY3In0=',
      submit_url: 'https://api.razorpay.com/otp_submit',
      resend_url: 'https://api.razorpay.com/otp_resend',
      metadata: {
        issuer: 'HDFC',
        network: 'VISA',
        last4: '0176',
        iin: '416021',
        gateway: 'hitachi',
        contact: '9723461024',
        ip: '10.2.1.33',
        resend_timeout: 30,
      },
      submit_url_private: 'https://api.razorpay.com/otp_submit',
      resend_url_private: 'https://api.razorpay.com/otp_resend',
    });
  } else if (coproto === 'otp') {
    await context.respondJSON({
      type: 'otp',
      request: {
        method: 'direct',
        content: '<html></html>',
      },
      version: 1,
      payment_id: 'pay_DevaXGbxgAKHE9',
      next: ['otp_submit', 'otp_resend'],
      gateway: 'eyJpdiI6InZyajhcLzFyZnppVEhtRkJHN0dKN',
      submit_url: 'https://api.razorpay.com/otp_submit',
      resend_url: 'https://api.razorpay.com/otp_resend',
      metadata: {
        issuer: 'HDFC',
        network: 'MC',
        last4: '9275',
        iin: '512967',
      },
      redirect: 'http://localhost:9008',
      submit_url_private: 'https://api.razorpay.com/otp_submit',
      resend_url_private: 'https://api.razorpay.com/otp_resend',
    });
  } else if (coproto === 'redirect') {
    await context.respondJSON({
      type: 'redirect',
      request: {
        content: null,
        method: 'POST',
        url: 'https://api.razorpay.com/v1/payments/K1rL2EogDLgqFZ/authenticate',
      },
      version: 1,
      payment_id: 'pay_K4FTlb6UsuaRWH',
      amount: '\u20b9 1',
      image: null,
      magic: false,
    });
  } else {
    await context.respondJSON({
      type: 'first',
      request: {
        url: 'https://api.razorpay.com/bank',
        method: 'post',
        content: [],
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
  }
}

async function handleBankRequest(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('api.razorpay.com/bank');
  await context.respondHTML(`<html></html>`);
}

async function enterCardDetails(
  context,
  {
    cardType,
    nativeOtp = false,
    recurring = false,
    emi = true,
    issuer = null,
    type = 'credit',
    dcc = false,
    internationalCard = false,
  } = {}
) {
  const visa = cardType === 'VISA';
  const bepg = nativeOtp && cardType === 'RUPAY';

  let cardNumber = '376939393939397';

  async function respondToIin(context) {
    await context.expectRequest((req) => {});

    const response = { http_status_code: 200 };
    const flows = {
      recurring,
      iframe: true,
    };

    if (nativeOtp) {
      flows.otp = true;
    }

    if (emi) {
      flows.emi = true;
      response.issuer = issuer;
      response.type = type;
    }

    if (internationalCard) {
      response.country = 'US';
    }

    response.flows = flows;

    await context.respondJSONP(response);
  }

  if (visa) {
    cardNumber = '4111111111111111';
  } else if (bepg) {
    cardNumber = '7878780000000001';
  }

  await context.page.type('#card_number', cardNumber);
  await context.getRequest(`/v1/payment/iin`);
  await respondToIin(context);

  await context.page.type('#card_expiry', '12/55');
  await context.page.type('#card_name', 'SakshiJain');
  await context.page.type('#card_cvv', visa ? '111' : '1111');
}

async function agreeToAMEXCurrencyCharges(context) {
  // needed for overlay animation
  await delay(200);
  context.page.click('#overlay .btn');
  await delay(200);
}

async function handleCustomerCardStatusRequest(context, cardType) {
  const req = await context.expectRequest();
  expect(req.url).toContain('customers/status');
  await context.respondJSON({ saved: true });
}

async function respondSavedCards(
  context,
  {
    nativeOtp = false,
    dcc = false,
    avsPrefillFromSavedCard = false,
    domesticSavedCard = false,
    tokenization,
  } = {}
) {
  const req = await context.expectRequest();
  expect(req.url).toContain('otp/verify');
  await context.respondJSON({
    success: 1,
    tokens: {
      entity: 'collection',
      count: 1,
      items: [
        {
          id: 'token_DJzzrEdHfU0i9u',
          entity: 'token',
          token: 'Hwc6phs3FatpXt',
          bank: null,
          wallet: null,
          method: 'card',
          consent_taken: !tokenization,
          dcc_enabled: dcc,
          card: {
            country: domesticSavedCard ? 'IN' : 'US',
            entity: 'card',
            name: 'Sakshi Jain',
            last4: '1111',
            network: 'Visa',
            type: 'debit',
            issuer: 'ICIC',
            international: false,
            emi: false,
            expiry_month: 12,
            expiry_year: 2055,
            flows: {
              recurring: false,
              iframe: true,
              otp: nativeOtp,
            },
          },
          billing_address: avsPrefillFromSavedCard
            ? {
                line1: AVS_DATA['line1'],
                line2: AVS_DATA['line2'],
                state: AVS_DATA['state'],
                country: AVS_DATA['country'],
                city: AVS_DATA['city'],
                postal_code: AVS_DATA['postal_code'],
              }
            : null,
          recurring: false,
          auth_type: null,
          mrn: null,
          used_at: 1568885760,
          created_at: 1568883319,
          expired_at: 2713890599,
        },
      ],
    },
  });

  // let UI be rendered
  await delay(600);
}

const getCardCurrencies = (amount, extraParams = {}) => {
  const normalizer = amount / 50000;
  return {
    recurring: false,
    all_currencies: {
      AED: {
        code: '784',
        denomination: 100,
        min_value: 10,
        min_auth_value: 10,
        symbol: 'د.إ',
        name: 'Emirati Dirham',
        amount: normalizer * 2625,
      },
      EUR: {
        code: '978',
        denomination: 100,
        min_value: 50,
        min_auth_value: 50,
        symbol: '€',
        name: 'Euro',
        amount: normalizer * 525,
      },
      GBP: {
        code: '826',
        denomination: 100,
        min_value: 30,
        min_auth_value: 30,
        symbol: '£',
        name: 'British Pound',
        amount: normalizer * 525,
      },
      INR: {
        code: '356',
        denomination: 100,
        min_value: 100,
        min_auth_value: 100,
        symbol: '₹',
        name: 'Indian Rupee',
        amount: normalizer * 50000,
      },
      USD: {
        code: '840',
        denomination: 100,
        min_value: 50,
        min_auth_value: 50,
        symbol: '$',
        name: 'US Dollar',
        amount: normalizer * 525,
      },
    },
    currency_request_id: 'EW1CiHoC8eARvW',
    card_currency: 'USD',
    wallet_currency: 'USD',
    ...extraParams,
  };
};

const getDisplayAmount = (currencyConfig) => {
  const { symbol, denomination, amount } = currencyConfig;
  const precision = Math.log10(denomination);
  return symbol + ' ' + (amount / denomination).toFixed(precision);
};

async function respondCurrencies(context, isAVS = false) {
  await context.getRequest(`/v1/payment/flows`);
  const req = await context.expectRequest();
  expect(req.url).toContain('/flows');
  expect(req.params).toHaveProperty('amount');
  expect(req.params).toHaveProperty('currency');
  const { amount } = req.params;
  const body = getCardCurrencies(amount, { avs_required: isAVS });
  await context.respondJSONP(body);
}

async function selectCurrency(context, code) {
  await context.page.waitForSelector('.more-btn');
  await context.page.click('.more-btn');
  await context.page.type('.search-box input', code);
  await context.page.click('.search-box .list-item');
}

async function selectAddNewCard(context) {
  await context.page.waitForSelector('#show-add-card');
  await context.page.click('#show-add-card');
}

async function expectDCCParametersInRequest(
  context,
  currency = 'USD',
  isAVS = false
) {
  const request = await context.expectRequest();
  const body = querystring.parse(request.body);
  let check = {
    currency_request_id: 'EW1CiHoC8eARvW',
    dcc_currency: currency,
  };
  if (isAVS) {
    check = {
      ...check,
      'billing_address[line1]': AVS_DATA['line1'],
      'billing_address[country]': AVS_DATA['country'],
      'billing_address[city]': AVS_DATA['city'],
      'billing_address[postal_code]': AVS_DATA['postal_code'],
    };
  }
  expect(body).toMatchObject(check);
}

async function expectAVSParametersInRequest(context) {
  const request = await context.expectRequest();
  const body = querystring.parse(request.body);
  let check = {
    'billing_address[line1]': AVS_DATA['line1'],
    'billing_address[country]': AVS_DATA['country'],
    'billing_address[city]': AVS_DATA['city'],
    'billing_address[postal_code]': AVS_DATA['postal_code'],
  };
  expect(body).toMatchObject(check);
}

async function selectSavedCardAndTypeCvv(context) {
  const SavedCard = await context.page.$('.saved-inner');
  await SavedCard.click();
  await SavedCard.type('222');
}
async function assertConsentCollectorForTokenization(context) {
  expect(await context.page.$eval('.secure-card-block', visible)).toEqual(true);
}
async function assertSaveCardCheckbox(context, state = true) {
  const el = await page.$('#should-save-card');
  expect(!!el).toBe(state);
}

async function verifySavedCardCheckbox(context, state) {
  const _state = await context.page.$('input#save.checkbox--square:checked');
  expect(!!_state).toEqual(state);
}
async function selectConsentCollectorForTokenization(context) {
  const checkboxLabel = await context.page.$('#should-save-card');
  await checkboxLabel.click();
}

async function verifyAmount(context, currency, isAVS = false) {
  const { options } = context;
  if (options.amount >= 1e5) {
    // >= 1k
    // skip validation as getDisplayAmount is not written for amount > 1k
    return;
  }
  const originalAmount = context.options.amount;
  const currencyConfig =
    getCardCurrencies(originalAmount).all_currencies[currency];
  const displayAmount = getDisplayAmount(currencyConfig);
  const amountInHeader = (await innerText('#amount')).trim();
  expect(amountInHeader).toEqual(displayAmount);
  const amountInFooter = (await innerText('#footer')).trim();
  if (isAVS) {
    expect(amountInFooter).toEqual('Proceed');
  } else {
    expect(amountInFooter).toEqual('Pay ' + displayAmount);
  }
}

async function selectCurrencyAndVerifyAmount({
  context,
  currency = 'USD',
  isAVS = false,
  withSiftJS = false,
}) {
  await respondCurrencies(context, isAVS);
  await selectCurrency(context, currency);
  await verifyAmount(context, currency, isAVS);
  if (withSiftJS) {
    // SiftJS integration will do a script fetch on DCC/Internal payment, hence it must be caught to avoid flow breaks
    await sendSiftJS(context);
  }
}

async function handleCREDUserValidation(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('/validate/account');
  const body = querystring.parse(req.body);
  expect(body).toMatchObject({
    entity: 'cred',
    value: '+91' + context.state.contact,
  });
  await context.respondJSON({
    success: true,
    data: {
      state: 'ELIGIBLE',
      tracking_id: 'abhdd-hshhus-skjss-shiiw-jshdjhs',
      offer: {
        description: 'Pay with Cred with 15% off!!',
      },
    },
  });
}

async function handleAppCreatePayment(context, { app, flow } = {}) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  if (app === 'google_pay') {
    const body = querystring.parse(req.body);
    expect(body).toMatchObject({
      provider: 'google_pay',
    });
    expect(body).not.toHaveProperty('card[number]');
    await context.respondJSON({
      version: '1.0',
      type: 'application',
      application_name: 'google_pay',
      payment_id: 'pay_GqAUUr978elhqA',
      gateway: '*encrypted gateway value*',
      request: {
        url: 'https://api.razorpay.com/v1/payments/pay_GqAUUr978elhqA/status',
        method: 'sdk',
        content: {
          bundle: {
            apiVersion: '1.0',
            allowedPaymentMethods: [
              {
                type: 'CARD',
                parameters: {
                  allowedCardNetworks: ['VISA', 'MASTERCARD'],
                },
              },
            ],
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'razorpay',
                gatewayMerchantId: 'Gr978elhqAGqAU',
                gatewayTransactionId: 'pay_GqAUUr978elhqA',
              },
            },
            transactionInfo: {
              currencyCode: 'INR',
              totalPrice: '100',
              totalPriceStatus: 'FINAL',
            },
          },
        },
      },
    });

    return;
  } else if (app === 'cred' && flow === 'intent') {
    const body = querystring.parse(req.body);
    expect(body).toMatchObject({
      method: 'app',
      provider: 'cred',
      app_present: '1',
    });
    expect(body).not.toHaveProperty('card[number]');
    await context.respondJSON({
      type: 'intent',
      version: 1,
      payment_id: 'pay_F2pqrpQCgRS6ae',
      data: {
        intent_url:
          'credpay://checkout?ref_id=22323482-f73f-4c60-85b7-a673d43ffbf9&is_collect=false&redirect_to=https%3A%2F%2Fbeta-api.stage.razorpay.in%2Fv1%2Fpayments%2Fpay_F2pqrpQCgRS6ae%2Fcallback%2F4733245ccd35a14a0a40ea1732fa106b001c0fa8%2Frzp_live_aEZD9dPPpUfCeq',
      },
      request: {
        url: 'https://api.razorpay.com/v1/payments/pay_GqAUUr978elhqA/status',
        method: 'GET',
      },
    });

    return;
  } else if (app === 'cred' && flow === 'collect') {
    const body = querystring.parse(req.body);
    expect(body).toMatchObject({
      method: 'app',
      provider: 'cred',
    });
    expect(body).not.toMatchObject({
      app_present: '1',
    });
    expect(body).not.toHaveProperty('card[number]');
    await context.respondJSON({
      type: 'intent',
      version: 1,
      payment_id: 'pay_F2pqrpQCgRS6ae',
      data: {
        intent_url:
          'credpay://checkout?ref_id=22323482-f73f-4c60-85b7-a673d43ffbf9&is_collect=false&redirect_to=https%3A%2F%2Fbeta-api.stage.razorpay.in%2Fv1%2Fpayments%2Fpay_F2pqrpQCgRS6ae%2Fcallback%2F4733245ccd35a14a0a40ea1732fa106b001c0fa8%2Frzp_live_aEZD9dPPpUfCeq',
      },
      request: {
        url: 'https://api.razorpay.com/v1/payments/pay_GqAUUr978elhqA/status',
        method: 'GET',
      },
    });

    return;
  } else if ((app = 'cred' && flow === 'newUser')) {
    const body = querystring.parse(req.body);
    expect(body).toMatchObject({
      method: 'app',
      provider: 'cred',
      '_[agent][device]': 'mobile',
    });
    await context.respondJSON({
      type: 'first',
      request: {
        url: 'http://localhost:9008',
        method: 'redirect',
      },
      payment_id: 'pay_DLXKaJEF1T1KxC',
      amount: '\u20b9 51',
      image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
    });
  } else {
    throw `Payment create not handled for ${app}`;
  }
}

async function handleAppPaymentStatus(context) {
  const req = await context.expectRequest();
  if (req.url.includes('v1/payments/pay_GqAUUr978elhqA/status')) {
    if (req.url.includes('Razorpay.jsonp')) {
      await context.respondJSONP({ razorpay_payment_id: 'pay_' });
    } else {
      await context.respondJSON({ razorpay_payment_id: 'pay_' });
    }
  }
}

async function assertOTPElementsForBEPG(context) {
  await assertTrimmedInnerText(context, '#form-otp .card-box', /Card - 0001$/);

  // await assertTrimmedInnerText(context, '#otp-resend', /Resend OTP \(\d{2}\)/);

  await assertTrimmedInnerText(
    context,
    '#form-otp .security-text',
    /^Your transaction/
  );
}

async function respondToPaymentFailure(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Payment failed',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'payment_failure',
      metadata: {
        next: [
          {
            action: 'suggest_retry',
            instruments: [
              {
                instrument: 'paypal',
                method: 'wallet',
              },
            ],
          },
        ],
      },
    },
  });
}

module.exports = {
  enterCardDetails,
  expectDCCParametersInRequest,
  handleCardValidation,
  handleCardValidationForNativeOTP,
  handleBankRequest,
  handleCustomerCardStatusRequest,
  respondSavedCards,
  respondCurrencies,
  selectCurrency,
  selectCurrencyAndVerifyAmount,
  selectSavedCardAndTypeCvv,
  verifyAmount,
  handleAppCreatePayment,
  handleAppPaymentStatus,
  assertOTPElementsForBEPG,
  agreeToAMEXCurrencyCharges,
  handleCREDUserValidation,
  fillAVSForm,
  assertAVSFormData,
  respondToPaymentFailure,
  expectAVSParametersInRequest,
  assertConsentCollectorForTokenization,
  selectConsentCollectorForTokenization,
  selectAddNewCard,
  assertSaveCardCheckbox,
  verifySavedCardCheckbox,
  getCardCurrencies,
};
