const fastify = require('fastify')()
const fs = require('fs')
const rawBody = require('raw-body')

const PORT = 5000
const HOST = '127.0.0.1'
global.ENDPOINT = `http://${HOST}:${PORT}`

const { respondJSON, delay } = require('./utils')

const { getPreferences } = require('./mocks/preferences')
const { getAjax, getCheckout } = require('./mocks/create')
const { getFlows, getIin } = require('./mocks/flows')
const { getOtpSubmit, getOtpResend } = require('./mocks/otp')
const { getMisc } = require('./mocks/misc')
const { preferredInsturments } = require('./mocks/personalisation')
const { getStatus } = require('./mocks/status')

fastify.addContentTypeParser('*', (req, done) => {
  rawBody(
    req,
    {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding: 'utf8', // Remove if you want a buffer
    },
    (err, body) => {
      if (err) {
        return done(err)
      }
      done(null, body)
    }
  )
})

fastify.register(require('fastify-cors'), {})
fastify.register(require('fastify-formbody'))

fastify.get('/v1/preferences', function(request, reply) {
  const preferences = getPreferences('hdfc_dc')
  respondJSON(preferences, request, reply)
})

fastify.get('/v1/personalisation', function(request, reply) {
  respondJSON(preferredInsturments, request, reply)
})

fastify.get('/v1/payment/iin', async function(request, reply) {
  const response = getIin(request.query)
  await delay(100)
  respondJSON(response, request, reply)
})

fastify.get('/v1/payment/flows', async function(request, reply) {
  const flows = getFlows(request.query)
  await delay(100)
  respondJSON(flows, request, reply)
})

fastify.get('/v1/payments/:id/status', async function(request, reply) {
  let response
  if (Math.random() > 0.5) {
    response = getStatus('success')
  } else {
    response = getStatus('created')
  }
  await delay(100)
  respondJSON(response, request, reply)
})

fastify.post('/v1/payments/create/checkout', async function(request, reply) {
  console.log(request.body)
  await delay(100)
  reply.send(getCheckout(request.body))
})

fastify.post('/v1/payments/create/ajax', async function(request, reply) {
  console.log(request.body)
  await delay(100)
  const body = getAjax(request.body)
  if (typeof body === 'object') {
    reply.send(body)
  } else {
    reply.type('text/html').send(body)
  }
})

fastify.post('/v1/payments/:payment_id/authentication/redirect', async function(
  request,
  reply
) {
  await delay(100)
  reply.type('text/html').send(fs.readFileSync('./html/bank.html', 'utf8'))
})

fastify.get('/v1/customers/status/:phone', async function(request, reply) {
  await delay(100)
  reply.send({ saved: true })
})

fastify.post('/v1/payments/calculate/fees', async function(request, reply) {
  await delay(100)
  const response = getFees()
  reply.send(response)
})

fastify.get('/v1/payments/:payment_id/cancel', async function(request, reply) {
  reply.code(400).send({
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Payment processing cancelled by user',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'payment_cancelled',
      metadata: { payment_id: 'pay_F9zA01NXXLFBCh' },
    },
  })
})

fastify.post('/v1/payments/:payment_id/otp_submit/:token', async function(
  request,
  reply
) {
  await delay(100)
  if (Math.random() > 0.5) {
    reply.send(getOtpSubmit('success'))
  } else {
    reply.send(getOtpSubmit('incorrect'))
  }
})

fastify.post('/v1/payments/:payment_id/otp_resend', async function(
  request,
  reply
) {
  await delay(100)
  reply.send(getOtpResend('hdfc'))
})

fastify.post('/v1/otp/verify', async function(request, reply) {
  const { query } = request
  await delay(100)
  // Odd OTPs are invalid, evens are valid
  if (Number(request.body.otp) % 2 === 1) {
    return reply.send({ error: {} })
  }
  if (query.provider) {
    const response = getMisc(query.provider)
    return reply.send(response)
  }
  reply.send(getMisc('saved_methods'))
})

fastify.post('/v1/payments/:payment_id/redirect_callback', async function(
  request,
  reply
) {
  await delay(100)
  reply.send('Payment complete')
})

fastify.post('/v1/otp/create', (request, reply) => {
  reply.send({
    success: 1,
  })
})

fastify.listen(PORT, HOST, (err, address) => {
  if (err) {
    reject(err)
  }
  console.log('\x1b[33m%s\x1b[0m', `\nMock-API Server started at ${address}`)
})

module.exports = fastify
