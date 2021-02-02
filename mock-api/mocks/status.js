const status = {
  created: {
    status: 'created',
  },
  error: {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'User is waitlisted',
      source: 'customer',
      step: 'payment_authentication',
      reason: 'invalid_otp',
      metadata: {
        payment_id: 'pay_EDNBKIP31Y4jl8',
        order_id: 'order_DBJKIP31Y4jl8',
      },
    },
  },
  success: {
    razorpay_payment_id: 'pay_',
  },
}

const getStatus = type => status[type]

module.exports = { getStatus }
