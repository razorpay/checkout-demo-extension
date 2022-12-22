import { get } from 'svelte/store';
import { setCustomer } from '../customer';
import { contact, email } from 'checkoutstore/screens/home';
import { getCustomer } from 'checkoutframe/customer';

const tokens = {
  entity: 'collection',
  count: 2,
  items: [
    {
      id: 'token_HMpQW2ILsIXGxA',
      entity: 'token',
      token: 'DlK0TQeEFlUtcH',
      bank: null,
      wallet: null,
      method: 'card',
      consent_taken: false,
      card: {
        country: 'US',
        entity: 'card',
        name: 'user',
        last4: '7369',
        network: 'Visa',
        type: 'debit',
        issuer: 'ICIC',
        international: true,
        emi: true,
        sub_type: 'consumer',
        expiry_month: 12,
        expiry_year: 2023,
        flows: {
          recurring: false,
          iframe: false,
        },
      },
      vpa: null,
      recurring: false,
      recurring_details: {
        status: 'not_applicable',
        failure_reason: null,
      },
      auth_type: null,
      mrn: null,
      used_at: 1630040299,
      created_at: 1623649462,
      expired_at: 1704047399,
      dcc_enabled: false,
    },
    {
      id: 'token_EGADb8swOCgtto',
      entity: 'token',
      token: 'GdRdKb81MWAp3e',
      bank: null,
      wallet: null,
      method: 'card',
      consent_taken: false,
      dcc_enabled: true,
      card: {
        entity: 'card',
        country: 'IN',
        name: 'Siddharth Goswami',
        last4: '0176',
        network: 'MasterCard',
        type: 'debit',
        issuer: 'HDFC',
        international: false,
        emi: true,
        expiry_month: 2,
        expiry_year: 2025,
        flows: { otp: true, recurring: false, iframe: false },
      },
      vpa: null,
      recurring: false,
      auth_type: null,
      mrn: null,
      used_at: 1584088371,
      created_at: 1581583041,
      expired_at: 1740767399,
    },
  ],
};

describe('setCustomer tests', () => {
  test('should not set contact if status is rejected', async () => {
    setCustomer({
      status: 'rejected',
    } as any);

    expect(get(contact)).toBe('');
  });

  test('should set contact if only contact is present', async () => {
    setCustomer({
      status: 'resolved',
      contact: '+919999999999',
    } as any);

    expect(get(contact)).toBe('+919999999999');
  });

  test('should not set contact or email if contact is missing', async () => {
    setCustomer({
      status: 'resolved',
      email: 'demo@demo.com',
    } as any);

    expect(get(email)).toBe('');
  });

  test('should set contact and email when both present', async () => {
    setCustomer({
      status: 'resolved',
      contact: '+919999999999',
      email: 'demo@demo.com',
    } as any);

    expect(get(contact)).toBe('+919999999999');
    expect(get(email)).toBe('demo@demo.com');
  });

  test('should set token when present', async () => {
    setCustomer({
      status: 'resolved',
      contact: '+919999999999',
      email: 'demo@demo.com',
      tokens: tokens,
    } as any);

    expect(get(contact)).toBe('+919999999999');
    expect(get(email)).toBe('demo@demo.com');
    expect(
      getCustomer('+919999999999', null, true)?.tokens?.items?.length
    ).toBe(2);
  });
});
