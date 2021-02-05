const preferredInsturments = {
  preferred_methods: {
    default: {
      instruments: [
        {
          instrument: 'dsd@okhdfcbank',
          method: 'upi',
          score: 0.54,
        },
        {
          instrument: 'phonepe',
          method: 'wallet',
          score: 0.54,
        },
      ],
      is_customer_identified: true,
      user_aggregates_available: false,
    },
    '+918800844282': {
      instruments: [
        {
          instrument: 'dsd@okhdfcbank',
          method: 'upi',
          score: 0.54,
        },
        {
          instrument: 'phonepe',
          method: 'wallet',
          score: 0.54,
        },
      ],
      is_customer_identified: true,
      user_aggregates_available: false,
    },
  },
}
module.exports = { preferredInsturments }
