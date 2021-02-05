const express = require('express');
const router = express.Router();

module.exports = router;

const { respondJSON, delay } = require('./utils');

const { getPreferences } = require('./mocks/preferences');
const { getAjax, getCheckout } = require('./mocks/create');
const { getFlows, getIin } = require('./mocks/flows');
const { getOtpSubmit, getOtpResend } = require('./mocks/otp');
const { getMisc } = require('./mocks/misc');
const { preferredInsturments } = require('./mocks/personalisation');
const { getStatus } = require('./mocks/status');

router.get('/v1/preferences', function(request, response) {
  const preferences = getPreferences('hdfc_dc');
  respondJSON(preferences, request, response);
});

router.get('/v1/personalisation', function(request, response) {
  respondJSON(preferredInsturments, request, response);
});

router.get('/v1/payment/iin', async function(request, response) {
  const preparedResponse = getIin(request.query);
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

router.get('/v1/payment/flows', async function(request, response) {
  const flows = getFlows(request.query);
  await delay(100);
  respondJSON(flows, request, response);
});

router.get('/v1/payments/:id/status', async function(request, response) {
  let preparedResponse;
  if (Math.random() > 0.5) {
    response = getStatus('success');
  } else {
    response = getStatus('created');
  }
  await delay(100);
  respondJSON(preparedResponse, request, response);
});

router.post('/v1/payments/create/checkout', async function(request, response) {
  await delay(100);
  response.send(getCheckout(request.body));
});

router.post('/v1/payments/create/ajax', async function(request, response) {
  await delay(100);
  const body = getAjax(request.body);
  if (typeof body === 'object') {
    response.send(body);
  } else {
    response.type('text/html').send(body);
  }
});

router.post('/v1/payments/:payment_id/authentication/redirect', async function(
  request,
  response
) {
  await delay(100);
  response.type('text/html').send(fs.readFileSync('./html/bank.html', 'utf8'));
});

router.get('/v1/customers/status/:phone', async function(request, response) {
  await delay(100);
  response.send({ saved: true });
});

router.post('/v1/payments/calculate/fees', async function(request, response) {
  await delay(100);
  const preparedResponse = getFees();
  response.send(preparedResponse);
});

router.get('/v1/payments/:payment_id/cancel', async function(
  request,
  response
) {
  response.code(400).send({
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

router.post('/v1/payments/:payment_id/otp_submit/:token', async function(
  request,
  response
) {
  await delay(100);
  if (Math.random() > 0.5) {
    response.send(getOtpSubmit('success'));
  } else {
    response.send(getOtpSubmit('incorrect'));
  }
});

router.post('/v1/payments/:payment_id/otp_resend', async function(
  request,
  response
) {
  await delay(100);
  response.send(getOtpResend('hdfc'));
});

router.post('/v1/otp/verify', async function(request, response) {
  const { query } = request;
  await delay(100);
  // Odd OTPs are invalid, evens are valid
  if (Number(request.body.otp) % 2 === 1) {
    return response.send({ error: {} });
  }
  if (query.provider) {
    const response = getMisc(query.provider);
    return response.send(preparedResponse);
  }
  response.send(getMisc('saved_methods'));
});

router.post('/v1/payments/:payment_id/redirect_callback', async function(
  request,
  response
) {
  await delay(100);
  response.send('Payment complete');
});

router.post('/v1/otp/create', (request, response) => {
  response.send({
    success: 1,
  });
});

module.exports = router;
