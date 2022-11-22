import { getMonthDiff, formatToMMSS } from '../date';

describe('getMonthDiff tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('Nov 01 2022 00:00:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  test('should return correct month diff', async () => {
    expect(
      getMonthDiff(new Date('Sep 01 2022 00:00:00').getTime() / 1000)
    ).toBe(2);

    expect(
      getMonthDiff(new Date('Oct 03 2022 00:00:00').getTime() / 1000)
    ).toBe(0);
  });
});

describe('formatToMMSS tests', () => {
  test('should correctly format seconds', async () => {
    expect(formatToMMSS(10)).toBe('00:10');
    expect(formatToMMSS(60)).toBe('01:00');
    expect(formatToMMSS(70)).toBe('01:10');
    expect(formatToMMSS(600)).toBe('10:00');
    expect(formatToMMSS(6600)).toBe('110:00');
  });
});
