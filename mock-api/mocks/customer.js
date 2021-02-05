const tokens = {
  card_upi: {
    entity: 'collection',
    count: 3,
    items: [
      {
        id: 'token_F6XrqSlsyBXaIv',
        entity: 'token',
        token: 'IqhmKb695rjtbs',
        bank: null,
        wallet: null,
        method: 'upi',
        vpa: { username: 'johndoe', handle: 'okhdfcbank', name: null },
        recurring: false,
        recurring_details: { status: null, failure_reason: null },
        auth_type: null,
        mrn: null,
        used_at: 1589391009,
        created_at: 1593020010,
        start_time: null,
        dcc_enabled: false,
      },
      {
        id: 'token_Ea0SBktVnlsCnq',
        entity: 'token',
        token: 'GpLvD0pudZYrhH',
        bank: null,
        wallet: null,
        method: 'card',
        card: {
          entity: 'card',
          name: 'John Doe',
          last4: '0176',
          network: 'Visa',
          type: 'debit',
          issuer: 'HDFC',
          international: false,
          emi: true,
          global_fingerprint: '21ecbae75f20a3baeb14edd3cff432c7',
          sub_type: 'consumer',
          expiry_month: 2,
          expiry_year: 2024,
          flows: { otp: true, recurring: false, iframe: false },
        },
        vpa: null,
        recurring: false,
        auth_type: null,
        mrn: null,
        used_at: 1588302840,
        created_at: 1585915456,
        expired_at: 1740767399,
        dcc_enabled: false,
      },
      {
        id: 'token_DxGzKR9hjdARiF',
        entity: 'token',
        token: '5XL7O9jWDqIe8G',
        bank: null,
        wallet: null,
        method: 'card',
        card: {
          entity: 'card',
          name: 'Mark',
          last4: '8882',
          network: 'MasterCard',
          type: 'credit',
          issuer: 'HDFC',
          international: false,
          emi: true,
          global_fingerprint: '4d1114f1054f1433e06f7f176ae84094',
          sub_type: 'consumer',
          expiry_month: 12,
          expiry_year: 2024,
          flows: { otp: true, recurring: true, iframe: false },
        },
        vpa: null,
        recurring: false,
        auth_type: null,
        mrn: null,
        used_at: 1588769789,
        created_at: 1577458420,
        expired_at: 1672511399,
        dcc_enabled: false,
      },
    ],
  },
}

const getTokens = (name = 'card_upi') => {
  return tokens[name]
}

module.exports = { getTokens }
