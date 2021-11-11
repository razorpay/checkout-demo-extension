import { delayLoginOTPExperiment } from 'card/helper';
import { isGlobalVault, shouldRememberCustomer } from 'checkoutstore/index.js';

jest.mock('checkoutstore/index.js', () => ({
  isGlobalVault: jest.fn((cb) => (cb ? cb() : true)),
  shouldRememberCustomer: jest.fn((cb) => (cb ? cb() : true)),
}));

jest.mock('card/experiments', () => ({
  delayOTP: {
    enabled: jest.fn((cb) => (cb ? cb() : true)),
  },
}));

describe('delayLoginOTPExperiment', () => {
  test('GlobalVault + Remember Customer + experiment enabled', () => {
    expect(delayLoginOTPExperiment()).toBe(true);
  });

  test('Local Vault + Remember Customer + experiment enabled', () => {
    isGlobalVault.mockImplementation(() => false);
    expect(delayLoginOTPExperiment()).toBe(false);
  });

  test('Global Vault + Remember Customer False + experiment enabled', () => {
    shouldRememberCustomer.mockImplementation(() => false);
    expect(delayLoginOTPExperiment()).toBe(false);
  });
});
