import { getInstrumentDetails } from '../helpers';

describe('test #getInstrumentDetails', () => {
  test('verify event data for card', () => {
    const instrument = {
      block: {
        code: 'rzp.preferred',
        _type: 'block',
        title: 'Preferred Payment Methods',
      },
      consent_taken: false,
      id: 'KHQYLuZRaoYX8e',
      issuers: ['ICIC'],
      meta: { preferred: true },
      method: 'card',
      networks: ['Visa'],
      section: 'p13n',
      skipCTAClick: false,
      token_id: 'token_HMpQW2ILsIXGxA',
      types: ['debit'],
    };

    expect(getInstrumentDetails(instrument)).toStrictEqual({
      issuer: 'ICIC',
      personalisation: true,
      saved: true,
      type: 'debit',
      network: 'Visa',
    });
  });
  test('verify event data for upi', () => {
    const instrument = {
      block: {
        code: 'rzp.preferred',
        _type: 'block',
        title: 'Preferred Payment Methods',
      },
      flows: ['collect'],
      id: 'b740feb2_rzp.preferred_0_0_upi_true',
      meta: { preferred: true },
      method: 'upi',
      section: 'p13n',
      skipCTAClick: false,
      token_id: 'token_GpaXi2JbdnNQo4',
      vpas: ['testupi@ybl'],
    };

    expect(getInstrumentDetails(instrument)).toStrictEqual({
      name: 'PhonePe',
      personalisation: true,
      saved: true,
      type: 'collect',
      vpa: '@ybl',
    });
  });

  test('verify event data for wallet', () => {
    const instrument = {
      block: {
        code: 'rzp.preferred',
        _type: 'block',
        title: 'Preferred Payment Methods',
      },
      id: 'b740feb2_rzp.preferred_0_0_wallet_true',
      meta: { preferred: true },
      method: 'wallet',
      section: 'p13n',
      skipCTAClick: false,
      wallets: ['FreeCharge'],
    };

    expect(getInstrumentDetails(instrument)).toStrictEqual({
      name: 'FreeCharge',
      personalisation: true,
      saved: false,
    });
  });

  test('verify event data for wallet', () => {
    const instrument = {
      block: {
        code: 'rzp.preferred',
        _type: 'block',
        title: 'Preferred Payment Methods',
      },
      id: 'b740feb2_rzp.preferred_0_0_netbanking_true',
      meta: { preferred: true },
      method: 'netbanking',
      section: 'p13n',
      skipCTAClick: false,
      banks: ['SBIN'],
    };

    expect(getInstrumentDetails(instrument)).toStrictEqual({
      name: 'SBIN',
      personalisation: true,
      saved: false,
    });
  });
});
