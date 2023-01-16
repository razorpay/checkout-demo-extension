import { getPerformanceResourceTiming } from '../core';
import { samplePerformanceEntryList } from '../__mocks__/core';

describe('getPerformanceResourceTiming tests', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue(samplePerformanceEntryList),
      },
    });
  });
  test('should return required metric for available resource', async () => {
    expect(getPerformanceResourceTiming('checkout-frame.js')).toStrictEqual({
      startTime: 308,
      duration: 708.1999999880791,
      responseEnd: 1016.1999999880791,
      transferSize: 0,
      encodedBodySize: 0,
      decodedBodySize: 0,
    });
  });
  test('should not return metric for unavailable resource', async () => {
    expect(getPerformanceResourceTiming('/rewards')).toStrictEqual({});
  });
});
