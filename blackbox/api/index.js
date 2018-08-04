const fastify = require('fastify')();
fastify.register(require('fastify-formbody'));
const merchants = require('./merchants');
const payments = require('./payments');
const { allTests } = require('../plans/TestBase');

fastify.listen(3000, err => {
  if (err) throw err;
  console.log(`api listening on ${fastify.server.address().port}`);
});

fastify.decorateRequest('attempt', '');

fastify.addHook('preHandler', async (request, reply) => {
  if (request.params.visit) {
    request.apiUrl = `/api/${request.params.visit}/v1`;
    let test = allTests[request.params.visit];
    request.attempt = test.currentAttempt;
  }
  return reply.header('Access-Control-Allow-Origin', '*');
});

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

const makeForm = request => `<body onload='document.forms[0].submit()'>
  <form action='${request.url}' method='${request.method || 'get'}'>
    ${request.content &&
      Object.keys(request.content).map(
        k => `<input name='${k}' value='${request.content[k]}'>`
      )}
  </form></body>`;

const callbackHtml = data => {
  data = JSON.stringify(data);
  return `<script>opener.postMessage('${data}','*')</script>`;
};

const wait = request => request.attempt.promisePending('reply');

const waitHtml = async (request, reply) => {
  if (request.body && request.body.callback_url) {
    return reply.redirect(request.body.callback_url);
  }
  reply.header('content-type', 'text/html');
  return new Promise(resolve => {
    request.attempt.setPending('reply', data =>
      resolve(data.request ? makeForm(data.request) : callbackHtml(data))
    );
  });
};

const withNext = callback => (request, reply) => {
  request.attempt.next();
  return callback(request, reply);
};

const routes = [
  ['get', 'preferences', getPreferences],
  ['get', ':payment_id/status', getStatus],
  ['post', 'payments/create/ajax', wait],
  ['post', 'payments/create/checkout', waitHtml],
  ['post', ':payment_id/otp_submit', submitOtp],
  ['get', 'gateway/mocksharp/:payment_id', withNext(waitHtml)],
];

const prefix = '/api/:visit/v1/';
routes.forEach(([httpMethod, route, handler]) => {
  fastify[httpMethod](prefix + route, handler);
});

fastify.all('/:visit/callback_url', async (request, reply) => {
  reply.header('content-type', 'text/html');
  return new Promise(resolve => {
    request.attempt.setPending('reply', data =>
      resolve(`<script>__pptr_oncomplete(${JSON.stringify(data)})</script>`)
    );
  });
});
