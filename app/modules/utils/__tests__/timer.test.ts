import { timer } from 'utils/timer';

describe('timer tests', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('Nov 01 2022 00:00:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  test('should return correct elapsed time', () => {
    const timerFn = timer();
    jest.setSystemTime(new Date('Nov 01 2022 00:00:5'));
    expect(timerFn()).toBe(5000);
  });
});
