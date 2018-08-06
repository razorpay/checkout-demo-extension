const allPayments = {};

class Payment {
  constructor(id) {
    allPayments[id] = this;
  }
}

const payments = (module.exports = {
  create: request => methodHandlers[request.body.method](request),

  get: id => allPayments[id],

  callback: async (request, reply) => {
    reply.header('content-type', 'text/html');
    return `<script>__pptr_oncomplete({razorpay_payment_id:'${
      request.body.razorpay_payment_id
    }'})</script>`;
  },
});

const methodHandlers = {
  card: request => {
    let paymentId = request.paymentId;
    return {
      type: 'first',
      request: {
        url: `${request.apiUrl}/gateway/mocksharp/${paymentId}`,
        content: {
          paymentId,
        },
      },
      paymentId,
    };
  },

  wallet: body => {
    let payment_id = payments.createId();
    return {
      type: 'otp',
      request: {
        url: `${request.apiUrl}/payments/${payment_id}/otp_submit`,
        method: 'post',
        content: [],
      },
      payment_id,
    };
  },

  netbanking: body => {
    let payment_id = payments.createId();
    return {
      type: 'first',
      request: {
        url: `${baseUrl}/gateway/mocksharp/${payment_id}`,
        content: {
          payment_id,
        },
      },
      payment_id,
    };
  },

  upi: body => {
    let payment_id = payments.createId({ method: 'upi' });
    return {
      type: 'async',
      request: {
        url: `${baseUrl}/payments/${payment_id}/status`,
      },
    };
  },
};
