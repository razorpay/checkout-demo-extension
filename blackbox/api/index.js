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
      description: 'The api key provided is invalid'
    }
  };
});

fastify.post('/v1/payments/create/ajax', payments.create);

fastify.post('/v1/payments/:payment_id/otp_submit', async request => {
  return { razorpay_payment_id: request.params.payment_id };
});

fastify.get('/v1/payments/:payment_id/status', async request => {
  let payment = payments.get(request.params.payment_id);
  if (payment.method === 'upi') {
    if (!payment.statusHit) {
      payment.statusHit = 1;
      return { status: 'created' };
    }
    return { razorpay_payment_id: request.params.payment_id };
  }
});

fastify.post('/v1/payments/create/checkout', async (request, reply) => {
  reply.redirect('/v1/gateway/mocksharp');
});

fastify.get('/v1/gateway/mocksharp/:payment_id', async (request, reply) => {
  reply.header('content-type', 'text/html');
  return `<script>opener.postMessage({razorpay_payment_id:'${
    request.params.payment_id
  }'},'*')</script>`;
});
