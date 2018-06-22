const baseUrl = 'http://localhost:3000/v1';

const allPayments = {};

const payments = (module.exports = {
  create: async request => methodHandlers[request.body.method](request.body),

  createId: (paymentData = {}) => {
    let id = 'pay_' + Math.random();
    allPayments[id] = paymentData;
    return id;
  },

  get: id => allPayments[id]
});

const methodHandlers = {
  card: body => {
    let payment_id = payments.createId();
    return {
      type: 'first',
      request: {
        url: `${baseUrl}/gateway/mocksharp/${payment_id}`,
        content: {
          payment_id
        }
      },
      payment_id
    };
  },

  wallet: body => {
    let payment_id = payments.createId();
    return {
      type: 'otp',
      request: {
        url: `${baseUrl}/payments/${payment_id}/otp_submit`,
        method: 'post',
        content: []
      },
      payment_id
    };
  },

  netbanking: body => {
    let payment_id = payments.createId();
    return {
      type: 'first',
      request: {
        url: `${baseUrl}/gateway/mocksharp/${payment_id}`,
        content: {
          payment_id
        }
      },
      payment_id
    };
  },

  upi: body => {
    let payment_id = payments.createId({ method: 'upi' });
    return {
      type: 'async',
      request: {
        url: `${baseUrl}/payments/${payment_id}/status`
      }
    };
  }
};
