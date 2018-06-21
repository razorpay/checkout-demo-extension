const baseUrl = 'http://localhost:3000/v1';

module.exports = async request =>
  methodHandlers[request.body.method](request.body);

const createPaymentId = () => 'pay_' + Math.random();

const methodHandlers = {
  card: body => {
    let payment_id = createPaymentId();
    return {
      type: 'first',
      request: {
        url: `${baseUrl}/gateway/mocksharp`,
        content: {
          payment_id
        }
      },
      payment_id
    };
  },

  wallet: body => {
    let payment_id = createPaymentId();
    return {
      type: 'otp',
      request: {
        url: `${baseUrl}/payments/${payment_id}/otp_submit`,
        method: 'post',
        content: []
      },
      payment_id
    };
  }
};
