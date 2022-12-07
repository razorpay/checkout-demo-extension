import { updateActionAreaContentAndCTA } from 'handlers/common';
import { getSession } from 'sessionmanager';
import { querySelector } from 'utils/doc';
import { replaceRetryIfCorporateNetbanking } from '../netbanking';

jest.mock('sessionmanager', () => ({
  __esModule: true,
  getSession: jest.fn(() => ({
    screen: '',
  })),
}));

jest.mock('handlers/common', () => ({
  __esModule: true,
  updateActionAreaContentAndCTA: jest.fn(),
}));

jest.mock('utils/doc', () => ({
  __esModule: true,
  querySelector: jest.fn(() => ({
    focus: jest.fn(),
  })),
}));

describe('Test replaceRetryIfCorporateNetbanking', () => {
  it('should add retry payment method on error modal', () => {
    const session = getSession();
    replaceRetryIfCorporateNetbanking(
      session,
      'Payment is pending authorization. Request for authorization from approver.'
    );
    expect(updateActionAreaContentAndCTA).toBeCalledTimes(1);
    expect(querySelector).toBeCalledTimes(0);
  });

  it('should add retry payment method on error modal', () => {
    const session = getSession();
    replaceRetryIfCorporateNetbanking(
      session,
      'Payment is pending authorization.'
    );
    expect(updateActionAreaContentAndCTA).toBeCalledTimes(0);
    expect(querySelector).toBeCalledTimes(1);
  });
});
