const express = require('express');
const fs = require('fs');
const router = express.Router();

module.exports = router;

const { respondJSON, delay } = require('./utils');

const { getPreferences } = require('./mocks/preferences');
const { getAjax, getCheckout } = require('./mocks/create');
const { getFlows, getIin } = require('./mocks/flows');
const { getOtpSubmit, getOtpResend } = require('./mocks/otp');
const { getMisc } = require('./mocks/misc');
const { preferredMethodForTokenization } = require('./mocks/personalisation');
const { getStatus } = require('./mocks/status');
const { getFees } = require('./mocks/fees');
const { countries, states } = require('./mocks/countriesAndStates');

router.get('/v1/preferences', function (request, response) {
  const preferences = getPreferences(
    // request.query.cred_offer_experiment
    //   ? `cred_${request.query.cred_offer_experiment}`
    //   : 'hdfc_dc'
    'offers'
  );
  respondJSON(preferences, request, response);
});

router.get('/v1/personalisation', function (request, response) {
  respondJSON(preferredMethodForTokenization, request, response);
});

router.get('/v1/payment/iin', async function (request, response) {
  const preparedResponse = getIin(request.query);
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

router.get('/v1/payment/flows', async function (request, response) {
  const flows = getFlows(request.query);
  await delay(100);
  respondJSON(flows, request, response);
});

router.get('/v1/payments/:id/status', async function (request, response) {
  let preparedResponse;
  if (Math.random() > 0.5) {
    preparedResponse = getStatus('success');
  } else {
    preparedResponse = getStatus('created');
  }
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

router.get(
  '/v1/checkout/qr_code/:id/payment/status',
  async function (request, response) {
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

router.delete('/v1/checkout/order/:id', async function (request, response) {
  let preparedResponse = {
    close_reason: 'opt_out',
  };
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

router.post('/v1/payments/create/checkout', async function (request, response) {
  await delay(100);
  response.send(getCheckout(request.body));
});

router.post('/v1/payments/create/ajax', async function (request, response) {
  await delay(100);
  const body = getAjax(request.body);
  if (typeof body === 'object') {
    response.send(body);
  } else {
    response.type('text/html').send(body);
  }
});

router.post('/v1/checkout/order', async function (request, response) {
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

router.post(
  '/v1/payments/:payment_id/authentication/redirect',
  async function (request, response) {
    await delay(100);
    response
      .type('text/html')
      .send(fs.readFileSync('./html/bank.html', 'utf8'));
  }
);

router.get('/v1/customers/status/:phone', async function (request, response) {
  await delay(100);
  response.send({ saved: true });
});

router.post('/v1/payments/calculate/fees', async function (request, response) {
  // await delay(100);
  const preparedResponse = getFees();
  response.send(preparedResponse);
});

router.get(
  '/v1/payments/:payment_id/cancel',
  async function (request, response) {
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
  }
);

router.post(
  '/v1/payments/:payment_id/otp_submit/:token',
  async function (request, response) {
    await delay(100);
    if (Math.random() > 0.5) {
      response.send(getOtpSubmit('success'));
    } else {
      response.send(getOtpSubmit('incorrect'));
    }
  }
);

router.post(
  '/v1/payments/:payment_id/otp_resend',
  async function (request, response) {
    await delay(100);
    response.send(getOtpResend('hdfc'));
  }
);

router.post('/v1/otp/verify', async function (request, response) {
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

router.post(
  '/v1/payments/:payment_id/redirect_callback',
  async function (request, response) {
    await delay(100);
    response.send('Payment complete');
  }
);

router.post('/v1/otp/create', (request, response) => {
  response.send({
    success: 1,
  });
});

router.get('/v1/countries', (req, res) => {
  res.json(countries);
});

router.get('/v1/states/:countryCode', (req, res) => {
  res.json(states[req.query.countryCode || 'gb']);
});

module.exports = router;
