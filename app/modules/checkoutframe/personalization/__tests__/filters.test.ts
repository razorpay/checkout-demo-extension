import {
  isCardLessEmiProviderEnabled,
  isMethodEnabled,
} from 'checkoutstore/methods';
import { getAmount } from 'ui/components/MainModal/helper';
import * as filters from '../filters';
import {
  instrumentsForAvailableMethods,
  customer,
} from '../__mocks__/customer-params';

jest.mock('checkoutstore/methods', () => {
  return {
    ...jest.requireActual('checkoutstore/methods'),
    isMethodEnabled: jest.fn(() => true),
    isCardLessEmiProviderEnabled: jest.fn(() => {}),
  };
});

jest.mock('razorpay', () => {
  return {
    ...jest.requireActual('razorpay'),
    getAmount: jest.fn(() => 100000),
  };
});

describe('Module: personalization', () => {
  it('should return instruments as it is because no instrument should be filtered out', () => {
    const expectedReturnValue = [
      {
        '_[flow]': 'intent',
        frequency: 1,
        id: 'KjsdBFx9iwTOSz',
        method: 'upi',
        score: 0.09146117454163016,
        success: false,
        timestamp: 1669293828387,
        upi_app: 'com.phonepe.app',
        vendor_vpa: '@ybl',
      },
      {
        '_[flow]': 'directpay',
        frequency: 3,
        id: 'KjscHbhxbaguXc',
        method: 'upi',
        score: 0.20586980354645384,
        success: false,
        timestamp: 1669613365354,
        token_id: 'token_KEB4PhxxYwqgZK',
        vpa: 'prabhjeetkalsi00@oksbi',
      },
      {
        '_[upiqr]': true,
      },
    ];
    expect(
      filters.filterInstrumentsForAvailableMethods(
        instrumentsForAvailableMethods,
        { customer }
      )
    ).toEqual(expectedReturnValue);
  });
  it('should return an empty array because the method is invalid', () => {
    (isMethodEnabled as unknown as jest.Mock).mockReturnValue(false);
    const instruments = [
      {
        method: '',
      },
    ];
    expect(
      filters.filterInstrumentsForAvailableMethods(instruments, { customer })
    ).toEqual([]);
  });
  it('should return instrument as it is because wallet is a valid instrument', () => {
    (isMethodEnabled as unknown as jest.Mock).mockReturnValue(true);
    const instruments = [
      {
        method: 'paylater',
      },
    ];
    expect(
      filters.filterInstrumentsForAvailableMethods(instruments, { customer })
    ).toEqual(instruments);
  });
  it('should do return intruments array as it is because all the instruments will pass sanity checks', () => {
    const instruments = [
      {
        frequency: 1,
        id: 'KjsdBFx9iwTOSz',
        success: false,
        timestamp: 1669293828387,
        method: 'upi',
        '_[flow]': 'intent',
        upi_app: 'com.phonepe.app',
        vendor_vpa: '@ybl',
        score: 0.09113455888249114,
      },
      {
        frequency: 3,
        id: 'KjscHbhxbaguXc',
        success: false,
        timestamp: 1669613365354,
        '_[flow]': 'directpay',
        method: 'upi',
        token_id: 'token_KEB4PhxxYwqgZK',
        vpa: 'prabhjeetkalsi00@oksbi',
        score: 0.20532442314177135,
      },
      {
        frequency: 4,
        id: 'KjscVXl4YwsIy4',
        success: false,
        timestamp: 1669796003682,
        bank: 'SBIN',
        method: 'netbanking',
        score: 0.2685638116447387,
      },
    ];
    expect(filters.filterInstrumentsForSanity(instruments)).toEqual(
      instruments
    );
  });
  it('should return an empty error as the sanity check fails because of invalid upi vpa', () => {
    const instruments = [
      {
        id: 'KjscHbhxbaguXc',
        success: false,
        '_[flow]': 'directpay',
        method: 'upi',
        token_id: 'token_KEB4PhxxYwqgZK',
        vpa: 'prabhjeetkalsi00oksbi',
      },
    ];
    expect(filters.filterInstrumentsForSanity(instruments)).toEqual([]);
  });
  it('should return an empty array as the instrument does not have a valid emi provider', () => {
    const instruments = [
      {
        id: 'KjscVXl4YwsIy4',
        success: false,
        method: 'cardless_emi',
      },
    ];
    expect(filters.filterInstrumentsForSanity(instruments)).toEqual([]);
  });
  it('should return the instrument as it is because the amount requested is more than the minimum amount of provider for enabling cardless_emi', () => {
    const instruments = [
      {
        id: 'KjscVXl4YwsIy4',
        success: false,
        method: 'cardless_emi',
        provider: 'walnut369',
      },
    ];
    (isCardLessEmiProviderEnabled as unknown as jest.Mock).mockReturnValue(
      true
    );
    expect(filters.filterInstrumentsForSanity(instruments)).toEqual(
      instruments
    );
  });
});
