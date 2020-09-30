const { delay, innerText } = require('../util');
const { assertTrimmedInnerText } = require('../tests/homescreen/actions');
const querystring = require('querystring');

async function handleCardValidation(context, { urlShouldContain } = {}) {
  const req = await context.expectRequest();
  expect(req.url).toContain(urlShouldContain || 'create/ajax');
  await context.respondJSON({
    type: 'first',
    request: {
      url: 'http://localhost:9008',
      method: 'get',
      content: [],
    },
    payment_id: 'pay_DLXKaJEF1T1KxC',
    amount: '\u20b9 51',
    image: 'https://cdn.razorpay.com/logos/D3JjREAG8erHB7_medium.jpg',
  });
}

async function handleCardValidationForNativeOTP(
  context,
  { coproto, cardType, urlShouldContain } = {}
) {
  const req = await context.expectRequest();
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
  } = {}
) {
  const visa = cardType === 'VISA';
  const bepg = nativeOtp && cardType === 'RUPAY';

  let cardNumber = '376939393939397';

  if (visa) {
    cardNumber = '4111111111111111';
  } else if (bepg) {
    cardNumber = '7878780000000001';
  }

  await context.page.type('#card_number', cardNumber);

  await context.expectRequest(req => {});

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

  response.flows = flows;

  await context.respondJSONP(response);

  await context.page.type('#card_expiry', '12/55');
  await context.page.type('#card_name', 'SakshiJain');
  await context.page.type('#card_cvv', visa ? '111' : '1111');
}

async function handleCustomerCardStatusRequest(context, cardType) {
  const req = await context.expectRequest();
  expect(req.url).toContain('customers/status');
  await context.respondJSON({ saved: true });
}

async function respondSavedCards(
  context,
  { nativeOtp = false, dcc = false } = {}
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
          dcc_enabled: dcc,
          card: {
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

const getCardCurrencies = amount => {
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
  };
};

const getDisplayAmount = currencyConfig => {
  const { symbol, denomination, amount } = currencyConfig;
  const precision = Math.log10(denomination);
  return symbol + ' ' + (amount / denomination).toFixed(precision);
};

async function respondCurrencies(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('/flows');
  expect(req.params).toHaveProperty('amount');
  expect(req.params).toHaveProperty('currency');
  const { amount } = req.params;
  const body = getCardCurrencies(amount);
  await context.respondJSONP(body);
}

async function selectCurrency(context, code) {
  await context.page.waitForSelector('.more-btn');
  await context.page.click('.more-btn');
  await context.page.type('.search-curtain input', code);
  await context.page.click('.search-curtain .list-item');
}

async function expectDCCParametersInRequest(context, currency = 'USD') {
  const request = await context.expectRequest();
  const body = querystring.parse(request.body);
  expect(body).toMatchObject({
    currency_request_id: 'EW1CiHoC8eARvW',
    dcc_currency: currency,
  });
}

async function selectSavedCardAndTypeCvv(context) {
  const SavedCard = await context.page.$('.saved-inner');
  await SavedCard.click();
  await SavedCard.type('222');
}

async function verifyAmount(context, currency) {
  const originalAmount = context.options.amount;
  const currencyConfig = getCardCurrencies(originalAmount).all_currencies[
    currency
  ];
  const displayAmount = getDisplayAmount(currencyConfig);
  const amountInHeader = (await innerText('#amount')).trim();
  expect(amountInHeader).toEqual(displayAmount);
  const amountInFooter = (await innerText('#footer')).trim();
  expect(amountInFooter).toEqual('Pay ' + displayAmount);
}

async function selectCurrencyAndVerifyAmount(context, currency = 'USD') {
  await respondCurrencies(context);
  await selectCurrency(context, currency);
  await verifyAmount(context, currency);
}

async function handleAppCreatePayment(context, { app, flow } = {}) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  if (app === 'google_pay_cards') {
    const body = querystring.parse(req.body);
    expect(body).toMatchObject({
      method: 'card',
      application: 'google_pay',
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

  await assertTrimmedInnerText(context, '#otp-resend', /Resend OTP \(\d{2}\)/);

  await assertTrimmedInnerText(
    context,
    '#form-otp .security-text',
    /^Your transaction/
  );
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
};
