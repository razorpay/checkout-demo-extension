import { getFPXBanks, isUPIFlowEnabled } from 'checkoutstore/methods';
import { getMerchantMethods } from 'razorpay';

jest.mock('razorpay', () => {
  return {
    ...jest.requireActual('razorpay'),
    getMerchantMethods: jest.fn(),
    getMerchantOrder: jest.fn(() => ({
      method: 'upi',
    })),
    getAmount: jest.fn(() => 100),
    getOption: jest.fn((opt) => {
      if (opt === 'method.upi') {
        return null;
      }
    }),
    isInternational: jest.fn(() => false),
  };
});

describe('getFPXBanks', () => {
  test('should return list of fpx banks from preferences', () => {
    const bankList = {
      CITI: 'Citi Bank',
    };
    (getMerchantMethods as jest.Mock).mockReturnValue({
      fpx: bankList,
    });

    const banks = getFPXBanks();
    expect(banks).toEqual(bankList);
  });

  test('should return empty object if no banks in preferences', () => {
    (getMerchantMethods as jest.Mock).mockReturnValue({});

    const banks = getFPXBanks();
    expect(banks).toEqual({});
  });
});

describe('#isUPIFlowEnabled', () => {
  test('Test isUPIFlowEnabled for positive case passing valid flow name', () => {
    (getMerchantMethods as jest.Mock).mockReturnValue({ upi: true });

    expect(isUPIFlowEnabled('collect')).toBe(true);
  });
  test('Test isUPIFlowEnabled for negative case passing invalid flow name', () => {
    (getMerchantMethods as jest.Mock).mockReturnValue({ upi: true });

    expect(isUPIFlowEnabled('upi')).toBe(undefined);
  });
});
