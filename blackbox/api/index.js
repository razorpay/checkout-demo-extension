const fastify = require('fastify')();
fastify.register(require('fastify-formbody'));
const merchants = require('./merchants');
const payments = require('./payments');

fastify.listen(3000, err => {
  if (err) throw err;
  console.log(`api listening on ${fastify.server.address().port}`);
});

fastify.addHook('preHandler', async (request, reply) => {
  return reply.header('Access-Control-Allow-Origin', '*');
});

fastify.get('/v1/preferences', async (request, reply) => {
  let m = merchants.find(m => m.key_id === request.query.key_id);
  if (m) return m.preferences;
  return {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'The api key provided is invalid',
    },
  };
});

/**
 * Callback handler, not there in actual API. It's just here to test
 * redirect mode.
 */
fastify.post('/callback_url', payments.callback);

fastify.post('/v1/payments/create/ajax', payments.create);

fastify.post('/v1/payments/:payment_id/otp_submit', async request => {
  return { razorpay_payment_id: request.params.payment_id };
});

fastify.get('/v1/payments/:payment_id/status', async request => {
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
});

fastify.post('/v1/payments/create/checkout', async (request, reply) => {
  let payment = await payments.create(request);

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
    reply.redirect('/v1/gateway/mocksharp/' + payment.payment_id);
  }
});

fastify.get('/v1/gateway/mocksharp/:payment_id', (request, reply) => {
  // take a little time to process payment.
  // to avoid responding before js callbacks can be applied on client
  reply.header('content-type', 'text/html');
  reply.send(
    `<script>opener.postMessage({razorpay_payment_id:'${
      request.params.payment_id
    }'},'*')</script>`
  );
});
