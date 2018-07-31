const fastify = require('fastify')();
fastify.register(require('fastify-formbody'));
const merchants = require('./merchants');
const payments = require('./payments');
const { allTests } = require('../plans/TestBase');

fastify.listen(3000, err => {
  if (err) throw err;
  console.log(`api listening on ${fastify.server.address().port}`);
});

fastify.decorateRequest('paymentId', '');

fastify.addHook('preHandler', async (request, reply) => {
  if (request.params.visit) {
    request.apiUrl = `/api/${request.params.visit}/v1`;
    let test = allTests[request.params.visit];
    if (test.currentAttempt) {
      request.paymentId = 'pay_' + test.id + '_' + test.currentAttempt.id;
    }
  }
  return reply.header('Access-Control-Allow-Origin', '*');
});

/**
 * Callback handler, not there in actual API. It's just here to test
 * redirect mode.
 */
fastify.post('/callback_url', payments.callback);

const getPreferences = async (request, reply) => {
  let m = merchants.find(m => m.key_id === request.query.key_id);
  if (m) return m.preferences;
  return {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'The api key provided is invalid',
    },
  };
};

const createPaymentRedirect = async (request, reply) => {
  let payment = payments.create(request);

  if (request.body.callback_url) {
    reply.header('content-type', 'text/html');
    return `<body onload="document.forms[0].submit();">
      <form action="${request.body.callback_url}" method="POST">
        <input type='hidden' name='razorpay_payment_id' value='${
          payment.payment_id
        }'/>
      </form>
    </body>`;
  } else {
    reply.redirect(
      `/api/${request.params.visit}/v1/gateway/mocksharp/` + payment.payment_id
    );
  }
};

const submitOtp = request => {
  return { razorpay_payment_id: request.params.payment_id };
};

const getStatus = async request => {
  let payment = payments.get(request.params.payment_id);
  let result;
  if (payment.method === 'upi') {
    if (!payment.statusHit) {
      payment.statusHit = 1;
      result = { status: 'created' };
    }
    result = { razorpay_payment_id: request.params.payment_id };
  }
  if (request.query.callback) {
    return `${request.query.callback}(${JSON.stringify(result)})`;
  }
  return result;
};

const mocksharp = (request, reply) => {
  // take a little time to process payment.
  // to avoid responding before js callbacks can be applied on client
  console.log('mocksharp pptr', request.raw.headers['x-pptr-id']);
  reply.header('content-type', 'text/html');
  reply.send(``);
};

const routes = [
  ['get', 'preferences', getPreferences],
  ['get', ':payment_id/status', getStatus],
  ['post', 'payments/create/ajax', payments.create],
  ['post', 'payments/create/checkout', createPaymentRedirect],
  ['post', ':payment_id/otp_submit', submitOtp],
  ['get', 'gateway/mocksharp/:payment_id', mocksharp],
];

const prefix = '/api/:visit/v1/';
routes.forEach(([httpMethod, route, handler]) => {
  fastify[httpMethod](prefix + route, handler);
});
