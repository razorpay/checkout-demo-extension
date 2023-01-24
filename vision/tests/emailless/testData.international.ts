const emailLessPreference = (
  pref,
  options: { savedCard?: boolean; p13n?: boolean } = {
    savedCard: false,
    p13n: false,
  }
) => ({
  ...pref,
  features: {
    ...pref.features,
    show_email_on_checkout: false,
    email_optional_oncheckout: false,
    dcc: true,
  },
  ...(options.p13n
    ? {
        preferred_methods: {
          '+918888888888': {
            instruments: [
              {
                instrument: 'token_KSX1Mhcz5uq6wm',
                method: 'card',
                type: 'credit',
              },
            ],
            is_customer_identified: true,
            user_aggregates_available: true,
            versionID: 'v1',
          },
        },
      }
    : {}),
  ...(options.savedCard
    ? {
        customer: {
          tokens: {
            entity: 'collection',
            count: 1,
            items: [
              {
                id: 'token_KSX1Mhcz5uq6wm',
                method: 'card',
                card: {
                  entity: 'card',
                  name: '',
                  last4: '2568',
                  network: 'MasterCard',
                  type: 'credit',
                  issuer: 'UTIB',
                  international: true,
                  emi: false,
                  sub_type: 'consumer',
                  expiry_month: '01',
                  expiry_year: '2099',
                  flows: {
                    otp: true,
                    recurring: true,
                    iframe: false,
                  },
                  cobranding_partner: null,
                  country: 'US',
                },
                used_at: 1665505345,
                created_at: 1665505944,
                expired_at: 1764527399,
                consent_taken: true,
                status: 'active',
                source: 'merchant',
                dcc_enabled: true,
                compliant_with_tokenisation_guidelines: true,
              },
              {
                id: 'token_KSX1Mhcz5uq6dd',
                method: 'card',
                card: {
                  entity: 'card',
                  name: '',
                  last4: '2268',
                  network: 'MasterCard',
                  type: 'credit',
                  issuer: 'UTIB',
                  international: true,
                  emi: false,
                  sub_type: 'consumer',
                  expiry_month: '01',
                  expiry_year: '2099',
                  flows: {
                    otp: true,
                    recurring: true,
                    iframe: false,
                  },
                  cobranding_partner: null,
                  country: 'US',
                },
                used_at: 1665505345,
                created_at: 1665505944,
                expired_at: 1764527399,
                consent_taken: true,
                status: 'active',
                source: 'merchant',
                dcc_enabled: true,
                compliant_with_tokenisation_guidelines: true,
              },
            ],
          },
          email: '',
          contact: '+918888888888',
        },
      }
    : {}),
});

const baseTestCases = [
  {
    title: 'Emailless checkout, with MCC flow',
    options: { currency: 'USD', remember_customer: false },
    overrides: {
      preferences: emailLessPreference,
    },
  },
  {
    title: 'Emailless checkout, with DCC flow - Card Screen',
    options: { remember_customer: false },
    overrides: {
      preferences: emailLessPreference,
    },
  },
  {
    title: 'Emailless checkout, with DCC flow - Saved Card Screen',
    options: {},
    overrides: {
      preferences: (pref) => emailLessPreference(pref, { savedCard: true }),
    },
  },
  {
    title: 'Emailless checkout, with DCC flow - Saved Card Screen via p13n',
    options: {},
    p13n: true,
    overrides: {
      preferences: (pref) =>
        emailLessPreference(pref, { savedCard: true, p13n: true }),
    },
  },
];

export default baseTestCases;
