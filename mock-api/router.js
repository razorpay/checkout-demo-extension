const express = require('express');
const fs = require('fs');

const { respondJSON, delay, requireOnce } = require('./utils');

const app = express();

app.get('/v1/preferences', function (request, response) {
  const { getPreferences } = requireOnce('./mocks/preferences');

  const preferences = getPreferences(
    // request.query.cred_offer_experiment
    //   ? `cred_${request.query.cred_offer_experiment}`
    //   : 'hdfc_dc'
    'offers'
  );
  respondJSON(preferences, request, response);
});

app.get('/v1/personalisation', function (request, response) {
  const { preferredMethodForTokenization } = requireOnce(
    './mocks/personalisation'
  );
  respondJSON(preferredMethodForTokenization, request, response);
});

app.get('/v1/payment/iin', async function (request, response) {
  const { getIin } = requireOnce('./mocks/flows');

  const preparedResponse = getIin(request.query);
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

app.get('/v1/payment/flows', async function (request, response) {
  const { getFlows } = requireOnce('./mocks/flows');

  const flows = getFlows(request.query);
  await delay(100);
  respondJSON(flows, request, response);
});

app.get('/v1/payments/:id/status', async function (request, response) {
  const { getStatus } = requireOnce('./mocks/status');

  let preparedResponse;
  if (Math.random() > 0.5) {
    preparedResponse = getStatus('success');
  } else {
    preparedResponse = getStatus('created');
  }
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

app.get(
  '/v1/checkout/qr_code/:id/payment/status',
  async function (request, response) {
    const { getStatus } = requireOnce('./mocks/status');

    // response.status(400).send({
    //   error: {
    //     code: 'BAD_REQUEST_ERROR',
    //     description: 'Payment processing cancelled by user',
    //     source: 'customer',
    //     step: 'payment_authentication',
    //     reason: 'payment_cancelled',
    //     metadata: { payment_id: 'pay_F9zA01NXXLFBCh' },
    //   },
    // });
    let preparedResponse;
    // if (Math.random() > 0.5) {
    //   preparedResponse = getStatus('success');
    // } else {
    preparedResponse = getStatus('created');
    // }
    await delay(100);
    respondJSON(preparedResponse, request, response);
  }
);

app.delete('/v1/checkout/order/:id', async function (request, response) {
  let preparedResponse = {
    close_reason: 'opt_out',
  };
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

app.post('/v1/payments/create/checkout', async function (request, response) {
  const { getCheckout } = requireOnce('./mocks/create');

  await delay(100);
  response.send(getCheckout(request.body));
});

app.post('/v1/payments/create/ajax', async function (request, response) {
  const { getAjax } = requireOnce('./mocks/create');

  await delay(100);
  const body = getAjax(request.body);
  if (typeof body === 'object') {
    response.send(body);
  } else {
    response.type('text/html').send(body);
  }
});

app.post('/v1/checkout/order', async function (request, response) {
  await delay(100);
  response.json({
    enabled: Math.random() < 0.5,
    id: 'GFZIYx6rMbP6gs',
    qr_code: {
      id: 'qr_GFZIYx6rMbP6gs',
      type: 'upi_qr',
      name: 'More megastore',
      image_content:
        'upi://pay?ver=01&mode=15&pa=rzr.qrtestaccoun27230053@icici&pn=TestAccount&tr=RZPIXnO3BgccsO35Qqrv2&tn=PaymenttoTestAccount&cu=INR&mc=1234&qrMedium=04&am=123.45', // intent_url
      usage: 'single',
      fixed_amount: true,
      payment_amount: 100,
      description: 'Fine T-Shirt',
      customer_id: 'cust_CtqVT5hl9czGsG',
      close_by: 1681615838,
      notes: {
        purpose: 'Test UPI QR code notes',
      },
      status: 'active',
      close_reason: 'on_demand',
      payments_count_received: 100,
      payments_amount_received: 34500,
      closed_at: null,
      created_at: 1603942055,
    },
  });
});

app.post(
  '/v1/payments/:payment_id/authentication/redirect',
  async function (request, response) {
    await delay(100);
    response
      .type('text/html')
      .send(fs.readFileSync('./html/bank.html', 'utf8'));
  }
);

app.get('/v1/customers/status/:phone', async function (request, response) {
  await delay(100);
  response.send({ saved: true });
});

app.post('/v1/payments/calculate/fees', async function (request, response) {
  const { getFees } = requireOnce('./mocks/fees');

  const preparedResponse = getFees();
  response.send(preparedResponse);
});

app.get('/v1/payments/:payment_id/cancel', async function (request, response) {
  response.status(400).send({
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Payment processing cancelled by user',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'payment_cancelled',
      metadata: { payment_id: 'pay_F9zA01NXXLFBCh' },
    },
  });
});

app.post(
  '/v1/payments/:payment_id/otp_submit/:token',
  async function (request, response) {
    const { getOtpSubmit } = requireOnce('./mocks/otp');

    await delay(100);
    if (Math.random() > 0.5) {
      response.send(getOtpSubmit('success'));
    } else {
      response.send(getOtpSubmit('incorrect'));
    }
  }
);

app.post(
  '/v1/payments/:payment_id/otp_resend',
  async function (request, response) {
    const { getOtpResend } = requireOnce('./mocks/otp');

    await delay(100);
    response.send(getOtpResend('hdfc'));
  }
);

app.post('/v1/otp/verify', async function (request, response) {
  const { getMisc } = requireOnce('./mocks/misc');

  const { query } = request;
  await delay(100);
  // Odd OTPs are invalid, evens are valid
  if (Number(request.body.otp) % 2 === 1) {
    return response.send({ error: {} });
  }
  if (query.provider) {
    const preparedResponse = getMisc(query.provider);
    return response.send(preparedResponse);
  }
  response.send(getMisc('saved_methods'));
});

app.post(
  '/v1/payments/:payment_id/redirect_callback',
  async function (request, response) {
    await delay(100);
    response.send('Payment complete');
  }
);

app.post('/v1/otp/create', (request, response) => {
  response.send({
    success: 1,
  });
});

app.get('/v1/countries', (req, res) => {
  const { countries } = requireOnce('./mocks/countriesAndStates');

  res.json(countries);
});

app.get('/v1/states/:countryCode', (req, res) => {
  const { states } = requireOnce('./mocks/countriesAndStates');

  res.json(states[req.query.countryCode || 'gb']);
});

module.exports = app;
