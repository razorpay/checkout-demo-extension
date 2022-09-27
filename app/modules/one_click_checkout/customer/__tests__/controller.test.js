import {
  setCustomerConsentStatus,
  updateCustomerConsent,
} from 'one_click_checkout/customer/controller';

import { get, readable, writable } from 'svelte/store';
import {
  customerConsentStatus,
  shouldShowConsentCheckbox,
} from 'one_click_checkout/customer/store';

import { Events } from 'analytics';
import * as Service from 'one_click_checkout/customer/service';

jest.mock('analytics', () => {
  const originalModule = jest.requireActual('analytics');

  return {
    ...originalModule,
    Events: {
      TrackMetric: jest.fn(),
    },
  };
});

jest.mock('one_click_checkout/store', () => {
  const originalModule = jest.requireActual('one_click_checkout/store');
  const { writable } = jest.requireActual('svelte/store');

  return {
    ...originalModule,
    customerConsentStatus: writable(false),
  };
});

jest.mock('one_click_checkout/customer/service', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/customer/service'
  );
  return {
    ...originalModule,
    updateCustomerConsent: jest.fn(),
  };
});

jest.mock('one_click_checkout/customer/store', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/customer/store'
  );
  const { writable } = jest.requireActual('svelte/store');
  return {
    ...originalModule,
    shouldShowConsentCheckbox: writable(true),
    customerConsentStatus: writable(false),
  };
});

describe('1CC Controller tests', () => {
  describe('customer status tests', () => {
    describe('setCustomerConsentStatus tests', () => {
      test('it should set consent to false in case arg passed is null', () => {
        setCustomerConsentStatus(null);

        expect(get(customerConsentStatus)).toBe(false);
      });

      test('it should set consent to true in case customer object is passed', () => {
        setCustomerConsentStatus(1);

        expect(get(customerConsentStatus)).toBe(true);
      });
    });

    describe('updateCustomerConsent tests', () => {
      test('should update customer consent when feature enabled', async () => {
        setCustomerConsentStatus(0);
        await updateCustomerConsent(true);

        expect(Service.updateCustomerConsent).toBeCalled();
      });

      test('should not update customer consent when feature disabled', async () => {
        shouldShowConsentCheckbox.set(false);
        setCustomerConsentStatus(0);

        await updateCustomerConsent(true);

        expect(Service.updateCustomerConsent).not.toBeCalled();
      });

      test('should not update customer consent when status has not changed', async () => {
        shouldShowConsentCheckbox.set(true);
        setCustomerConsentStatus(0);

        await updateCustomerConsent(false);

        expect(Service.updateCustomerConsent).not.toBeCalled();
      });

      test('should track when service call fails', async () => {
        setCustomerConsentStatus(0);
        Service.updateCustomerConsent.mockRejectedValue({
          error: 'Mock error',
        });
        await updateCustomerConsent(true);

        expect(Events.TrackMetric).toBeCalled();
      });
    });
  });
});
