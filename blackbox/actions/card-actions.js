const { delay, innerText } = require('../util');
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
  { coproto, urlShouldContain } = {}
) {
  const req = await context.expectRequest();
  expect(req.url).toContain(urlShouldContain || 'create/ajax');
  if (coproto === 'otp') {
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

async function enterCardDetails(context, { cardType, nativeOtp = false } = {}) {
  const visa = cardType === 'VISA';
  await context.page.type(
    '#card_number',
    visa ? '4111111111111111' : '376939393939397'
  );
  await context.expectRequest(req => {});
  const flows = {
    recurring: false,
    iframe: true,
    http_status_code: 200,
  };
  if (nativeOtp) {
    flows.otp = true;
  }
  await context.respondJSONP({ flows });
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
  expect(amountInFooter).toEqual('PAY ' + displayAmount);
}

async function selectCurrencyAndVerifyAmount(context, currency = 'USD') {
  await respondCurrencies(context);
  await selectCurrency(context, currency);
  await verifyAmount(context, currency);
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
};
