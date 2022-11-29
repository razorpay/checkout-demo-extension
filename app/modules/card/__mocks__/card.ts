export const customerTokens = {
  entity: 'collection',
  count: 1,
  items: [
    {
      id: 'token_KiFoudKTPqzKmw',
      entity: 'token',
      token: 'IPngHJoB14Wevk',
      bank: null,
      wallet: null,
      method: 'card',
      card: {
        entity: 'card',
        name: '',
        last4: '7222',
        network: 'Visa',
        type: 'credit',
        issuer: 'ICIC',
        international: false,
        emi: true,
        sub_type: 'consumer',
        token_iin: '445238428',
        expiry_month: '12',
        expiry_year: '2099',
        flows: {
          otp: true,
          recurring: true,
          iframe: false,
        },
        cobranding_partner: null,
        country: 'IN',
      },
      vpa: null,
      recurring: false,
      recurring_details: {
        status: 'not_applicable',
        failure_reason: null,
      },
      auth_type: null,
      mrn: null,
      used_at: 1668938812,
      created_at: 1668938811,
      expired_at: 1709231399,
      consent_taken: true,
      status: 'active',
      notes: [],
      dcc_enabled: false,
      billing_address: null,
      compliant_with_tokenisation_guidelines: true,
      plans: false,
      cvvDigits: 3,
      debitPin: false,
    },
  ],
};

export const selctedTokenId = 'token_KiFoudKTPqzKmw';

export const selctedToken = customerTokens.items[0];
