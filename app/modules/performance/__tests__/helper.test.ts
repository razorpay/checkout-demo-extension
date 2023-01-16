import { getPerformanceDataForCriticalCheckoutResources } from '../helper';
import { samplePerformanceEntryList } from '../__mocks__/core';

describe('getPerformanceDataForCriticalCheckoutResources tests', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue(samplePerformanceEntryList),
      },
    });
  });
  test('should return required metric for available resource', async () => {
    expect(getPerformanceDataForCriticalCheckoutResources()).toStrictEqual({
      'checkout-frame.js': {
        startTime: 308,
        duration: 708.1999999880791,
        responseEnd: 1016.1999999880791,
        transferSize: 0,
        encodedBodySize: 0,
        decodedBodySize: 0,
      },
      'checkout.css': {
        startTime: 307.40000000596046,
        duration: 386.19999998807907,
        responseEnd: 693.5999999940395,
        transferSize: 0,
        encodedBodySize: 0,
        decodedBodySize: 0,
      },
      preferences: {
        startTime: 5609.699999988079,
        duration: 896.2000000178814,
        responseEnd: 6505.9000000059605,
        transferSize: 22591,
        encodedBodySize: 22291,
        decodedBodySize: 22291,
      },
    });
  });
});
