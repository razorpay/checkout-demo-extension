import { getMonthDiff, formatToMMSS, getDayDiff } from '../date';

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

describe('getDayDiff tests', () => {
  test('should return correct elapsed days', async () => {
    expect(
      getDayDiff(
        new Date('Oct 17 2022 00:00:00').getTime(),
        new Date('Nov 07 2022 00:00:00').getTime()
      )
    ).toBe(21);
    expect(
      getDayDiff(
        new Date('Nov 06 2022 23:59:00').getTime(),
        new Date('Nov 07 2022 00:00:00').getTime()
      )
    ).toBe(0);
  });
});
