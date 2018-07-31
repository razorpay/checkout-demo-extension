const baseUrl = 'http://localhost:3000/v1';

let newTargets = 0;
const allPayments = {};

const updateTargets = delta => {
  newTargets = newTargets + delta;
  console.log(newTargets);
  if (!newTargets) {
    payments.targets.currentResolve();
    payments.targets.currentPromise = null;
  } else if (newTargets === 1 && delta === 1) {
    payments.targets.currentPromise = new Promise(resolve => {
      payments.targets.currentResolve = resolve;
    });
  }
};

const payments = (module.exports = {
  // targets which do not have x-pptr-id header set
  targets: {
    currentPromise: null,
    inc: () => updateTargets(1),
    dec: () => updateTargets(-1),
    onReady: callback => {
      return async function() {
        let currentPromise = payments.targets.currentPromise;
        if (currentPromise) {
          await currentPromise;
        }
        callback.apply(this, arguments);
      };
    },
  },

  create: request => methodHandlers[request.body.method](request.body),

  get: id => allPayments[id],

  callback: async (request, reply) => {
    reply.header('content-type', 'text/html');
    return `<script>__pptr_oncomplete({razorpay_payment_id:'${
      request.body.razorpay_payment_id
    }'})</script>`;
  },
});

const methodHandlers = {
  card: body => {
    let payment_id = '123';
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

  wallet: body => {
    let payment_id = payments.createId();
    return {
      type: 'otp',
      request: {
        url: `${baseUrl}/payments/${payment_id}/otp_submit`,
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
