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
};

const preferredMethodForTokenization = {
  preferred_methods: {
    '+918111111111': {
      instruments: [
        { instrument: 'testupi@provider', method: 'upi' },
        {
          instrument: 'token_HMpQW2ILsIXGxA',
          method: 'card',
          issuer: 'UTIB',
          type: 'debit',
          network: 'Visa',
          consent_taken: false,
        },
        {
          instrument: 'token_EGADb8swOCgtto',
          method: 'card',
          issuer: 'UTIB',
          type: 'debit',
          network: 'Visa',
          consent_taken: false,
        },
        { instrument: '9490530954@ybl', method: 'upi' },
      ],
      is_customer_identified: true,
      user_aggregates_available: true,
      versionID: 'v1',
    },
  },
};
module.exports = { preferredInsturments, preferredMethodForTokenization };
