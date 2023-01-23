export function* preferences({ options, response }) {
  if (options.key) {
    yield response.json({
      id: 'key',
      label: 'Default preferences with key',
      data: {
        ...BASE_PREFERENCES,
        merchant_key: options.key,
        mode: options.key.startsWith('rzp_live_') ? 'live' : 'test',
      },
    });

    /**
     * Optional contact
     */
    yield response.json({
      id: 'optional_contact',
      label: 'Preferences with optional contact',
      data: {
        ...BASE_PREFERENCES,
        merchant_key: options.key,
        mode: options.key.startsWith('rzp_live_') ? 'live' : 'test',
        optional: ['contact'],
      },
    });

    /**
     * Optional Email
     */
    yield response.json({
      id: 'optional_email',
      label: 'Preferences with optional email',
      data: {
        ...BASE_PREFERENCES,
        merchant_key: options.key,
        mode: options.key.startsWith('rzp_live_') ? 'live' : 'test',
        optional: ['email'],
      },
    });

    /**
     * Optional Contact and Email
     */
    yield response.json({
      id: 'optional_contact_email',
      label: 'Preferences with optional contact & email',
      data: {
        ...BASE_PREFERENCES,
        merchant_key: options.key,
        mode: options.key.startsWith('rzp_live_') ? 'live' : 'test',
        optional: ['contact', 'email'],
        features: {
          show_email_on_checkout: true,
          email_optional_oncheckout: true,
        },
      },
    });
  }
}

const BASE_PREFERENCES = {
  options: {
    image: null,
    remember_customer: true,
  },
  fee_bearer: false,
  version: 1,
  language_code: 'en',
  merchant_key: 'rzp_test_1DP5mmOlF5G5ag',
  merchant_name: 'Razorpay',
  mode: 'test',
  magic: true,
  blocked: false,
  activated: true,
  features: {
    show_email_on_checkout: true,
    email_optional_oncheckout: false,
  },
  methods: {
    entity: 'methods',
    card: true,
    debit_card: true,
    credit_card: true,
    prepaid_card: true,
    card_networks: {
      AMEX: 1,
      DICL: 0,
      MC: 1,
      MAES: 1,
      VISA: 1,
      JCB: 1,
      RUPAY: 1,
      BAJAJ: 0,
    },
    card_subtype: { consumer: 1, business: 1, premium: 0 },
    amex: true,
    netbanking: {
      AUBL: 'AU Small Finance Bank',
      AIRP: 'Airtel Payments Bank',
      ANDB: 'Andhra Bank',
      UTIB: 'Axis Bank',
    },
    wallet: {
      mobikwik: true,
      payzapp: true,
      olamoney: true,
      airtelmoney: true,
      amazonpay: true,
      freecharge: true,
      jiomoney: true,
      phonepe: true,
      paypal: true,
    },
    emi: true,
    upi: true,
    cardless_emi: {
      fdrl: true,
      hdfc: true,
      icic: true,
      kkbk: true,
      barb: true,
      earlysalary: true,
      zestmoney: true,
    },
    paylater: { getsimpl: true, icic: true, lazypay: true },
    google_pay_cards: false,
    app: {
      cred: 0,
      twid: 0,
      trustly: 0,
      poli: 0,
      sofort: 0,
      giropay: 0,
    },
    gpay: false,
    emi_types: { credit: true, debit: true },
    debit_emi_providers: { HDFC: 0 },
    nach: false,
    cod: false,
    offline: false,
    bank_transfer: true,
    emi_subvention: 'customer',
    emi_plans: {
      HDFC: { min_amount: 300000, plans: { 3: 16 } },
    },
    emi_options: {
      HDFC: [
        {
          duration: 3,
          interest: 16,
          subvention: 'customer',
          min_amount: 300000,
          merchant_payback: '2.61',
        },
      ],
    },
    upi_intent: true,
    upi_type: { collect: 1, intent: 1 },
    app_meta: [],
  },
  global: true,
  checkout_config: {
    display: {
      hide: [{ method: 'card' }],
      blocks: {
        used: {
          name: 'Frequently Used Methods',
          instruments: [
            { method: 'card' },
            { method: 'wallet', wallets: ['amazonpay'] },
          ],
        },
      },
      sequence: ['block.used'],
    },
  },
  org: {
    isOrgRazorpay: true,
    checkout_logo_url:
      'https://dashboard-activation.s3.amazonaws.com/org_100000razorpay/checkout_logo/phpmeNFmd',
  },
  rtb: true,
  rtb_experiment: { experiment: false },
  experiments: {
    checkout_redesign_v1_5: true,
  },
};
