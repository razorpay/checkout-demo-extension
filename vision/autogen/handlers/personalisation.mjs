export default function* handlePersonalisation() {
  yield BASE_PERSONALISATION;
}

const BASE_PERSONALISATION = {
  preferred_methods: {
    '+918888888888': {
      instruments: [
        { instrument: 'card', method: 'card' },
        { instrument: 'phonepe', method: 'wallet' },
        { instrument: '@paytm', method: 'upi' },
        { instrument: '@oksbi', method: 'upi' },
        { instrument: '@okicici', method: 'upi' },
        { instrument: '@upi', method: 'upi' },
        { instrument: 'getsimpl', method: 'paylater' },
        { instrument: 'amazonpay', method: 'wallet' },
        { instrument: '@ibl', method: 'upi' },
        { instrument: null, method: 'netbanking' },
        { instrument: '@ybl', method: 'upi' },
        { instrument: '@okhdfcbank', method: 'upi' },
        { instrument: '@okaxis', method: 'upi' },
        { instrument: null, method: 'upi' },
        { instrument: '@axl', method: 'upi' },
      ],
      is_customer_identified: true,
      user_aggregates_available: true,
      versionID: 'v1',
    },
  },
  rtb_experiment: { experiment: false },
};
