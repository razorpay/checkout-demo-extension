import { checkoutClosesAt } from 'checkoutframe/timer';
import { get } from 'svelte/store';
import {
  getReadableTimeLeft,
  getRelativeGracefulTime,
  isCheckoutTimerBeyondCurrentTimer,
  readableTimeLeft,
  startTimer,
} from '../timer';
// This is for spy
import * as timerFunctions from '../timer';

jest.useFakeTimers();
describe('#getRelativeGracefulTime tests', () => {
  test('when there is no checkout timer, it should return expected-grace count', () => {
    expect(getRelativeGracefulTime(1200, 5)).toEqual(1195);
  });
  test('when there is a checkout timer, it should return (min of (expected,checkoutdimiss)-grace count)', () => {
    checkoutClosesAt.set(Date.now() + 1200);
    expect(getRelativeGracefulTime(1200, 5)).toEqual(1195);

    checkoutClosesAt.set(Date.now() + 1000);
    expect(getRelativeGracefulTime(1200, 5)).toEqual(995);
  });

  test('should always give [0,positive inifinity)', () => {
    checkoutClosesAt.set(Date.now() - 1000);
    expect(getRelativeGracefulTime(1200, 5)).toEqual(1195);
  });
});

describe('#isCheckoutTimerBeyondCurrentTimer tests', () => {
  beforeEach(() => {
    checkoutClosesAt.set(0);
  });
  test('should return false, when no args passed', () => {
    checkoutClosesAt.set(Date.now());
    expect(isCheckoutTimerBeyondCurrentTimer(0)).toBe(true);
  });
  test('should return true, when no timer', () => {
    expect(isCheckoutTimerBeyondCurrentTimer(Date.now() + 500)).toBe(true);
  });
  test('should return true when higher timer', () => {
    checkoutClosesAt.set(Date.now() + 1000);
    expect(isCheckoutTimerBeyondCurrentTimer(Date.now() + 500)).toBe(true);
  });
  test('should return false when lower timer', () => {
    checkoutClosesAt.set(Date.now() + 500);
    expect(isCheckoutTimerBeyondCurrentTimer(Date.now() + 1000)).toBe(false);
  });

  test('should return true on negative / edge cases', () => {
    checkoutClosesAt.set(Date.now() + -500);
    expect(isCheckoutTimerBeyondCurrentTimer(Date.now() + 1000)).toBe(true);
  });
});

const onExpire = jest.fn();
describe('#startTimer tests', () => {
  test('should return 0 if no time limit passed', () => {
    expect(startTimer(undefined as any, onExpire)).toBe(0);
    expect(startTimer('' as any, onExpire)).toBe(0);
    expect(startTimer(0 as any, onExpire)).toBe(0);
  });
  test('should clear old timer when new one is called', () => {
    const spyClearTimer = jest.spyOn(timerFunctions, 'clearTimer');
    // create first timer
    const firstTimer = startTimer(1000, onExpire);
    expect(firstTimer).toBeGreaterThanOrEqual(Date.now() + 1000);
    // create second timer
    expect(startTimer(2000, () => {})).toBeGreaterThanOrEqual(
      Date.now() + 2000
    );

    expect(spyClearTimer).toBeCalled();
  });

  test('should new timer expiration time on successful timer set ', () => {
    expect(startTimer(1000, onExpire)).toBeGreaterThanOrEqual(
      Date.now() + 1000
    );
  });
  test('should call onExpire properly post timer completion', () => {
    expect(startTimer(1000, onExpire)).toBeGreaterThanOrEqual(
      Date.now() + 1000
    );
    jest.advanceTimersByTime(1500);
    expect(onExpire).toBeCalled();
  });
  test('should update readable timer state properly', () => {
    expect(startTimer(2000, onExpire)).toBeGreaterThanOrEqual(
      Date.now() + 2000
    );
    jest.advanceTimersByTime(500);
    expect(get(readableTimeLeft)).toBe('0:02');
    jest.advanceTimersByTime(1000);
    expect(get(readableTimeLeft)).toBe('0:01');
    jest.advanceTimersByTime(1000);
    expect(onExpire).toBeCalled();
  });
});

describe('#getReadableTimeLeft tests', () => {
  beforeEach(() => [timerFunctions.clearTimer()]);
  test('should return `` when no timer present', () => {
    expect(getReadableTimeLeft()).toBe('');
  });
  test('should return readable time', () => {
    expect(startTimer(2000, onExpire)).toBeGreaterThanOrEqual(
      Date.now() + 2000
    );
    jest.advanceTimersByTime(500);
    expect(getReadableTimeLeft()).toBe('0:02');
  });
});
