import { setupPreferences } from 'tests/setupPreferences';

import {
  isRemoveDefaultTokenizationSupported,
  reusePaymentIdExperimentEnabled,
  isRudderstackDisabled,
} from '../experiment';

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

jest.mock('../redesign', () => ({
  __esModule: true,
  ...jest.requireActual('../redesign'),
  isRedesignV15: jest.fn(() => true),
}));

describe('Test for experiment of isRemoveDefaultTokenizationSupported', () => {
  test('If this Experiment flag is not coming in preferences ', async () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        emi_ux_revamp: true,
        upi_qr_v2: false,
      },
    });
    expect(isRemoveDefaultTokenizationSupported()).toBe(false);
  });

  test('If this Experiment flag is ccoming in preferences as true ', async () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        emi_ux_revamp: true,
        upi_qr_v2: false,
        remove_default_tokenization_flag: true,
      },
    });
    expect(isRemoveDefaultTokenizationSupported()).toBe(true);
  });

  test('If this Experiment flag is coming in preferences as false ', async () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        emi_ux_revamp: true,
        upi_qr_v2: false,
        remove_default_tokenization_flag: false,
      },
    });

    expect(isRemoveDefaultTokenizationSupported()).toBe(false);
  });
});

describe('Test for experiment of isRudderstackDisabled', () => {
  test('If this Experiment flag is not coming', () => {
    expect(isRudderstackDisabled()).toBe(true);
  });

  test('If this Experiment flag is coming in preferences as true', () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        enable_rudderstack_plugin: true,
      },
    });

    expect(isRudderstackDisabled()).toBe(false);
  });

  test('If this Experiment flag is coming in preferences as false', () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        enable_rudderstack_plugin: false,
      },
    });

    expect(isRudderstackDisabled()).toBe(true);
  });
});

describe('Test for experiment of reusePaymentIdExperimentEnabled', () => {
  test('If this Experiment flag is not coming in preferences as true ', async () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        emi_ux_revamp: true,
        upi_qr_v2: false,
        reuse_upi_paymentId: true,
      },
    });

    expect(reusePaymentIdExperimentEnabled()).toBe(true);
  });

  test('If this Experiment flag is  coming in preferences as false ', async () => {
    setupPreferences('loggedIn', razorpayInstance, {
      experiments: {
        emi_ux_revamp: true,
        upi_qr_v2: false,
        reuse_upi_paymentId: false,
      },
    });

    expect(reusePaymentIdExperimentEnabled()).toBe(false);
  });
});
