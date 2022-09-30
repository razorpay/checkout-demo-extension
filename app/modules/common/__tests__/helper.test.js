import { makeUrl, getInstrumentsWithOrder } from 'common/helper';
import { Track } from 'analytics';

describe('Make Url', () => {
  it('should not make session token url for non standard checkout', function () {
    Track.props.library = 'razorpayjs';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/preferences'
    );
  });

  it('should make session token url for standard checkout', function () {
    Track.props.library = 'checkoutjs';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/standard_checkout/preferences?session_token=DEMO_SESSION_TOKEN'
    );
  });

  it('should make session token url for hosted checkout', function () {
    Track.props.library = 'hosted';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/standard_checkout/preferences?session_token=DEMO_SESSION_TOKEN'
    );
  });

  it('should not make session token url for standard checkout when session token is not present', function () {
    Track.props.library = 'checkoutjs';
    global.session_token = '';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/preferences'
    );
  });

  it('should not make session token url for standard checkout when explicitly disabled', function () {
    Track.props.library = 'checkoutjs';
    global.session_token = '';
    expect(makeUrl('preferences', false)).toBe(
      'https://api.razorpay.com/v1/preferences'
    );
  });

  it('should append query param when a query param already exists', function () {
    Track.props.library = 'hosted';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences?key=value')).toBe(
      'https://api.razorpay.com/v1/standard_checkout/preferences?key=value&session_token=DEMO_SESSION_TOKEN'
    );
  });
});

describe('test getInstrumentsWithOrder utility', () => {
  it('should return correct ordered data for wallet method`', function () {
    const data = [
      {
        power: false,
        name: 'PhonePe',
        h: 20,
        code: 'phonepe',
        logo: 'https://cdn.razorpay.com/wallet/phonepe.png',
        sqLogo: 'https://cdn.razorpay.com/wallet-sq/phonepe.png',
      },
      {
        power: false,
        name: 'Amazon Pay',
        h: 28,
        code: 'amazonpay',
        logo: 'https://cdn.razorpay.com/wallet/amazonpay.png',
        sqLogo: 'https://cdn.razorpay.com/wallet-sq/amazonpay.png',
      },
      {
        power: true,
        name: 'Mobikwik',
        h: 20,
        code: 'mobikwik',
        logo: 'https://cdn.razorpay.com/wallet/mobikwik.png',
        sqLogo: 'https://cdn.razorpay.com/wallet-sq/mobikwik.png',
      },
      {
        power: false,
        name: 'PayPal',
        h: 20,
        code: 'paypal',
        logo: 'https://cdn.razorpay.com/wallet/paypal.png',
        sqLogo: 'https://cdn.razorpay.com/wallet-sq/paypal.png',
      },
    ];
    const expectedResult = {
      1: { name: 'PhonePe', order: 1 },
      2: { name: 'Amazon Pay', order: 2 },
      3: { name: 'Mobikwik', order: 3 },
      4: { name: 'PayPal', order: 4 },
    };
    expect(getInstrumentsWithOrder(data, 'wallet')).toStrictEqual(
      expectedResult
    );
  });
  it('should return correct ordered data for card method`', function () {
    const data = [
      {
        id: 'token_JsowJcB2ltMhd7',
        entity: 'token',
        token: '8bYSD2x6PTFvav',
        bank: null,
        wallet: null,
        method: 'card',
        card: {
          entity: 'card',
          name: 'Lorem Ipsum',
          last4: '8738',
          network: 'MasterCard',
          type: 'debit',
          issuer: 'YESB',
          international: false,
          emi: false,
          sub_type: 'consumer',
          token_iin: null,
          expiry_month: 12,
          expiry_year: 2024,
          flows: {
            otp: true,
            recurring: false,
            iframe: false,
          },
          country: 'IN',
          networkCode: 'mastercard',
          downtimeSeverity: false,
        },
        vpa: null,
        recurring: false,
        recurring_details: {
          status: 'not_applicable',
          failure_reason: null,
        },
        auth_type: null,
        mrn: null,
        used_at: 1657708463,
        created_at: 1657708462,
        expired_at: 1735669799,
        consent_taken: true,
        status: null,
        notes: [],
        dcc_enabled: false,
        billing_address: null,
        compliant_with_tokenisation_guidelines: false,
        plans: false,
        cvvDigits: 3,
        debitPin: false,
      },
    ];
    const expectedResult = {
      1: { name: 'YESB', order: 1 },
    };
    expect(getInstrumentsWithOrder(data, 'cards')).toStrictEqual(
      expectedResult
    );
  });
  it('should return correct ordered data for upi method`', function () {
    const data = [
      {
        id: 'token_GpaXi2JbdnNQo4',
        entity: 'token',
        token: '8NHRLBA1JXAzVN',
        bank: null,
        wallet: null,
        method: 'upi',
        vpa: {
          username: 'testupi@provider',
          handle: 'ybl',
          name: 'TEST USER',
          status: 'valid',
          received_at: 1616391822,
        },
        recurring: false,
        recurring_details: {
          status: 'not_applicable',
          failure_reason: null,
        },
        auth_type: null,
        mrn: null,
        used_at: 1616391823,
        created_at: 1616391823,
        start_time: null,
        dcc_enabled: false,
      },
    ];
    const expectedResult = {
      1: { name: 'PhonePe', order: 1 },
    };
    expect(getInstrumentsWithOrder(data, 'upi')).toStrictEqual(expectedResult);
  });
});
