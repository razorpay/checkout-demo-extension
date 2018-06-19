const fastify = require('fastify')();
const merchants = require('./merchants');

fastify.listen(3000, err => {
  if (err) throw err;
  console.log(`api listening on ${fastify.server.address().port}`);
});

fastify.addHook('preHandler', async (request, reply) => {
  return reply.header('Access-Control-Allow-Origin', '*');
});

fastify.addContentTypeParser(
  'application/x-www-form-urlencoded',
  (req, done) => {
    done();
  }
);

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

fastify.post('/v1/payments/create/ajax', async (request, reply) => {
  let payment_id = 'pay_' + Math.random();
  return {
    type: 'otp',
    request: {
      url: `http://localhost:3000/v1/payments/${payment_id}/otp_submit`,
      method: 'post',
      content: []
    },
    payment_id
  };
});

fastify.post('/v1/payments/:payment_id/otp_submit', async (request, reply) => {
  return {
    razorpay_payment_id: request.params.payment_id
  };
});
